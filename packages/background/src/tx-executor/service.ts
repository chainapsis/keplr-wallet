import { KVStore } from "@keplr-wallet/common";
import { ChainsService } from "../chains";
import { KeyRingCosmosService } from "../keyring-cosmos";
import { KeyRingEthereumService } from "../keyring-ethereum";
import { AnalyticsService } from "../analytics";
import { RecentSendHistoryService } from "../recent-send-history";
import { BackgroundTxService } from "../tx";
import { BackgroundTxEthereumService } from "../tx-ethereum";
import { Env, KeplrError } from "@keplr-wallet/router";
import {
  TxExecution,
  TxExecutionStatus,
  TxExecutionType,
  BackgroundTx,
  BackgroundTxStatus,
  BackgroundTxType,
  EVMBackgroundTx,
  CosmosBackgroundTx,
  ExecutionTypeToHistoryData,
  TxExecutionResult,
  PendingTxExecutionResult,
} from "./types";
import {
  action,
  autorun,
  makeObservable,
  observable,
  runInAction,
  toJS,
} from "mobx";
import {
  AminoSignResponse,
  EthSignType,
  EthTxStatus,
} from "@keplr-wallet/types";
import { TransactionTypes, serialize } from "@ethersproject/transactions";
import { BaseAccount } from "@keplr-wallet/cosmos";
import { Any } from "@keplr-wallet/proto-types/google/protobuf/any";
import { Msg } from "@keplr-wallet/types";
import {
  buildSignedTxFromAminoSignResponse,
  prepareSignDocForAminoSigning,
  simulateCosmosTx,
  getCosmosGasPrice,
  calculateCosmosStdFee,
} from "./utils/cosmos";
import { fillUnsignedEVMTx } from "./utils/evm";
import { Subscriber, TxExecutableEvent } from "./internal";
export class BackgroundTxExecutorService {
  @observable
  protected recentTxExecutionSeq: number = 0;
  // Key: id (sequence, it should be increased by 1 for each)
  @observable
  protected readonly recentTxExecutionMap: Map<string, TxExecution> = new Map();

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainsService: ChainsService,
    protected readonly keyRingCosmosService: KeyRingCosmosService,
    protected readonly keyRingEthereumService: KeyRingEthereumService,
    protected readonly backgroundTxService: BackgroundTxService,
    protected readonly backgroundTxEthereumService: BackgroundTxEthereumService,
    protected readonly analyticsService: AnalyticsService,
    protected readonly recentSendHistoryService: RecentSendHistoryService,
    protected readonly subscriber: Subscriber<TxExecutableEvent>
  ) {
    makeObservable(this);
  }

  async init(): Promise<void> {
    console.log("[TxExecutor] Initializing...");

    const recentTxExecutionSeqSaved = await this.kvStore.get<number>(
      "recentTxExecutionSeq"
    );
    if (recentTxExecutionSeqSaved) {
      runInAction(() => {
        this.recentTxExecutionSeq = recentTxExecutionSeqSaved;
      });
    }
    autorun(() => {
      const js = toJS(this.recentTxExecutionSeq);
      this.kvStore.set<number>("recentTxExecutionSeq", js);
    });

    const recentTxExecutionMapSaved = await this.kvStore.get<
      Record<string, TxExecution>
    >("recentTxExecutionMap");
    if (recentTxExecutionMapSaved) {
      console.log(
        "[TxExecutor] Loaded saved executions:",
        Object.keys(recentTxExecutionMapSaved).length
      );
      runInAction(() => {
        let entries = Object.entries(recentTxExecutionMapSaved);
        entries = entries.sort(([, a], [, b]) => {
          return parseInt(a.id) - parseInt(b.id);
        });
        for (const [key, value] of entries) {
          this.recentTxExecutionMap.set(key, value);
        }

        this.cleanupOldExecutions();
      });
    }
    autorun(() => {
      // Only persist executions that may be blocked (preventAutoSign is true)
      const persistableExecutions = new Map<string, TxExecution>();
      for (const [key, value] of this.recentTxExecutionMap) {
        if (value.preventAutoSign) {
          persistableExecutions.set(key, value);
        }
      }
      const js = toJS(persistableExecutions);
      const obj = Object.fromEntries(js);
      this.kvStore.set<Record<string, TxExecution>>(
        "recentTxExecutionMap",
        obj
      );
    });

    this.subscriber.subscribe(async ({ executionId, executableChainIds }) => {
      console.log("[TxExecutor] Subscriber event received:", {
        executionId,
        executableChainIds,
      });

      const execution = this.getTxExecution(executionId);
      if (!execution) {
        console.log("[TxExecutor] Execution not found for id:", executionId);
        return;
      }

      const newExecutableChainIds = executableChainIds.filter(
        (chainId) => !execution.executableChainIds.includes(chainId)
      );

      if (newExecutableChainIds.length === 0) {
        console.log("[TxExecutor] No new executable chain ids");
        return;
      }

      console.log(
        "[TxExecutor] New executable chain ids:",
        newExecutableChainIds
      );

      runInAction(() => {
        // update the executable chain ids
        for (const chainId of newExecutableChainIds) {
          execution.executableChainIds.push(chainId);
        }
      });

      // if the key is hardware wallet, do not resume the execution automatically
      // user should sign the transaction manually
      const keyInfo = this.keyRingCosmosService.keyRingService.getKeyInfo(
        execution.vaultId
      );
      if (keyInfo?.type === "ledger" || keyInfo?.type === "keystone") {
        console.log("[TxExecutor] Hardware wallet detected, skip auto resume");
        return;
      }

      // cause new executable chain ids are available, resume the execution
      // CHECK: 현재 활성화되어 있는 vault에서만 실행해야 할까, 아니면 모든 vault에서 실행할 수 있어야 할까?
      console.log("[TxExecutor] Auto resuming execution:", executionId);
      await this.executeTxs(executionId);
    });

    console.log("[TxExecutor] Initialized");
  }

  /**
   * Execute multiple transactions sequentially
   * Execution id is returned if the execution is started successfully
   * and the execution will be started automatically after the transactions are recorded.
   */
  @action
  async recordAndExecuteTxs<T extends TxExecutionType>(
    env: Env,
    vaultId: string,
    type: T,
    txs: BackgroundTx[],
    executableChainIds: string[],
    historyData?: T extends TxExecutionType.UNDEFINED
      ? undefined
      : ExecutionTypeToHistoryData[T],
    historyTxIndex?: number
  ): Promise<TxExecutionResult> {
    console.log("[TxExecutor] recordAndExecuteTxs called:", {
      type,
      txCount: txs.length,
      executableChainIds,
      historyData,
      historyTxIndex,
    });

    if (!env.isInternalMsg) {
      throw new KeplrError("direct-tx-executor", 101, "Not internal message");
    }

    const keyInfo =
      this.keyRingCosmosService.keyRingService.getKeyInfo(vaultId);
    if (!keyInfo) {
      throw new KeplrError("direct-tx-executor", 102, "Key info not found");
    }

    console.log("[TxExecutor] Key type:", keyInfo.type);

    // If any of the transactions are not executable or the key is hardware wallet,
    // set preventAutoSign to true. This also determines if the execution needs persistence.
    const preventAutoSign =
      txs.some((tx) => !executableChainIds.includes(tx.chainId)) ||
      keyInfo.type === "ledger" ||
      keyInfo.type === "keystone";

    // at least first tx should be signed if preventAutoSign is true
    if (preventAutoSign) {
      const firstTx = txs[0];
      if (!firstTx) {
        throw new KeplrError(
          "direct-tx-executor",
          103,
          "First tx is not found"
        );
      }

      if (
        firstTx.signedTx == null ||
        !executableChainIds.includes(firstTx.chainId)
      ) {
        throw new KeplrError(
          "direct-tx-executor",
          104,
          "First tx should be signed and executable"
        );
      }
    }

    const id = (this.recentTxExecutionSeq++).toString();

    console.log("[TxExecutor] preventAutoSign:", preventAutoSign);

    const execution = {
      id,
      status: TxExecutionStatus.PENDING,
      vaultId: vaultId,
      txs: txs,
      txIndex: -1,
      executableChainIds: executableChainIds,
      timestamp: Date.now(),
      type,
      preventAutoSign,
      historyTxIndex,
      ...(type !== TxExecutionType.UNDEFINED ? { historyData } : {}),
    } as TxExecution;

    this.recentTxExecutionMap.set(id, execution);
    console.log("[TxExecutor] Execution created with id:", id);

    return await this.executeTxs(id);
  }

  /**
   * Execute blocked transactions by execution id and transaction index
   */
  async resumeTx(
    env: Env,
    id: string,
    txIndex?: number,
    signedTx?: string
  ): Promise<TxExecutionResult> {
    console.log("[TxExecutor] resumeTx called:", {
      id,
      txIndex,
      hasSignedTx: signedTx != null,
    });

    if (!env.isInternalMsg) {
      // TODO: 에러 코드 신경쓰기
      throw new KeplrError("direct-tx-executor", 101, "Not internal message");
    }

    return await this.executeTxs(id, {
      txIndex,
      signedTx,
    });
  }

  protected async executeTxs(
    id: string,
    options?: {
      txIndex?: number;
      signedTx?: string;
    }
  ): Promise<TxExecutionResult> {
    console.log("[TxExecutor] executeTxs started:", { id, options });

    const execution = this.getTxExecution(id);
    if (!execution) {
      throw new KeplrError("direct-tx-executor", 105, "Execution not found");
    }

    console.log("[TxExecutor] Current execution state:", {
      status: execution.status,
      txIndex: execution.txIndex,
      txCount: execution.txs.length,
      executableChainIds: execution.executableChainIds,
    });

    if (execution.status === TxExecutionStatus.PROCESSING) {
      throw new KeplrError(
        "direct-tx-executor",
        108,
        "Execution is already processing"
      );
    }

    // Only pending/processing/blocked executions can be executed
    const needResume =
      execution.status === TxExecutionStatus.PENDING ||
      execution.status === TxExecutionStatus.BLOCKED;
    if (!needResume) {
      console.log("[TxExecutor] No need to resume, status:", execution.status);
      return {
        status: execution.status,
      };
    }

    // check if the key is valid
    const keyInfo = this.keyRingCosmosService.keyRingService.getKeyInfo(
      execution.vaultId
    );
    if (!keyInfo) {
      throw new KeplrError("direct-tx-executor", 102, "Key info not found");
    }

    const executionStartIndex = Math.min(
      options?.txIndex ?? (execution.txIndex < 0 ? 0 : execution.txIndex),
      execution.txs.length - 1
    );

    console.log("[TxExecutor] Starting from index:", executionStartIndex);

    runInAction(() => {
      execution.status = TxExecutionStatus.PROCESSING;
    });

    for (let i = executionStartIndex; i < execution.txs.length; i++) {
      const currentTx = execution.txs[i];
      console.log(`[TxExecutor] Processing tx[${i}]:`, {
        chainId: currentTx.chainId,
        type: currentTx.type,
        status: currentTx.status,
      });

      const providedSignedTx =
        options?.txIndex != null && i === options.txIndex
          ? options.signedTx
          : undefined;

      const result = await this.executePendingTx(
        execution.vaultId,
        currentTx,
        execution.executableChainIds,
        execution.preventAutoSign ?? false,
        providedSignedTx
      );

      // Apply result in a single runInAction to minimize autorun triggers
      runInAction(() => {
        execution.txIndex = i;
        currentTx.status = result.status;
        // NOTE: no need to set signedTx as it's already consumed,
        // just set the result of pending tx execution
        if (result.txHash != null) {
          currentTx.txHash = result.txHash;
        }
        if (result.error != null) {
          currentTx.error = result.error;
        }
      });

      console.log(`[TxExecutor] tx[${i}] result:`, result.status);

      if (result.status === BackgroundTxStatus.CONFIRMED) {
        continue;
      }

      /**
       * If the tx is BLOCKED, it means multiple transactions are required
       * to be executed on different chains.
       *
       * - The execution should be stopped here,
       * - Record the history if needed,
       * - The execution should be resumed later when the condition is met.
       */
      if (result.status === BackgroundTxStatus.BLOCKED) {
        console.log("[TxExecutor] Execution BLOCKED at tx index:", i);
        runInAction(() => {
          execution.status = TxExecutionStatus.BLOCKED;
          this.recordHistoryIfNeeded(execution);

          // no need to keep the history data anymore
          delete execution.historyData;
        });
        return {
          status: execution.status,
        };
      }

      if (result.status === BackgroundTxStatus.FAILED) {
        console.log("[TxExecutor] Execution FAILED at tx index:", i);
        runInAction(() => {
          execution.status = TxExecutionStatus.FAILED;
          this.removeTxExecution(id);
        });

        return {
          status: execution.status,
          error: result.error,
        };
      }

      // something went wrong, should not happen
      throw new KeplrError(
        "direct-tx-executor",
        107,
        "Unexpected tx status: " + result.status
      );
    }

    // if the execution is completed successfully, update the batch status
    console.log("[TxExecutor] Execution COMPLETED");
    runInAction(() => {
      execution.status = TxExecutionStatus.COMPLETED;
      this.recordHistoryIfNeeded(execution);
      this.removeTxExecution(id);
    });

    return {
      status: execution.status,
    };
  }

  /**
   * Execute a pending transaction without modifying observable state.
   * Returns the result which should be applied by the caller using runInAction.
   * This reduces autorun trigger count by batching state updates.
   */
  protected async executePendingTx(
    vaultId: string,
    tx: BackgroundTx,
    executableChainIds: string[],
    preventAutoSign: boolean,
    providedSignedTx?: string
  ): Promise<PendingTxExecutionResult> {
    // Track mutable state locally without touching observable
    let status = tx.status;
    let signedTx = tx.signedTx ?? providedSignedTx;
    let txHash = tx.txHash;
    let error: string | undefined;

    // Already in final state
    if (
      status === BackgroundTxStatus.CONFIRMED ||
      status === BackgroundTxStatus.FAILED ||
      status === BackgroundTxStatus.CANCELLED
    ) {
      console.log(`[TxExecutor] tx already in final state:`, status);
      return { status, signedTx, txHash, error };
    }

    // Check if blocked
    if (
      status === BackgroundTxStatus.BLOCKED ||
      status === BackgroundTxStatus.PENDING
    ) {
      const isBlocked = !executableChainIds.includes(tx.chainId);
      console.log(`[TxExecutor] tx blocked check:`, {
        chainId: tx.chainId,
        executableChainIds,
        isBlocked,
      });

      if (isBlocked) {
        return { status: BackgroundTxStatus.BLOCKED, signedTx, txHash, error };
      }
      status = BackgroundTxStatus.SIGNING;
    }

    // If signedTx is already provided, skip to SIGNED
    if (signedTx) {
      console.log(`[TxExecutor] tx using provided signedTx`);
      status = BackgroundTxStatus.SIGNED;
    }

    // If preventAutoSign and not signed, block
    if (preventAutoSign && signedTx == null) {
      return { status: BackgroundTxStatus.BLOCKED, signedTx, txHash, error };
    }

    // SIGNING
    if (status === BackgroundTxStatus.SIGNING) {
      console.log(`[TxExecutor] tx SIGNING`);

      try {
        const result = await this.signTx(vaultId, tx);
        signedTx = result.signedTx;
        status = BackgroundTxStatus.SIGNED;
        console.log(`[TxExecutor] tx signed successfully`);
      } catch (e) {
        console.error(`[TxExecutor] tx signing failed:`, e);
        return {
          status: BackgroundTxStatus.FAILED,
          signedTx,
          txHash,
          error: e.message ?? "Transaction signing failed",
        };
      }
    }

    // BROADCASTING
    if (
      status === BackgroundTxStatus.SIGNED ||
      status === BackgroundTxStatus.BROADCASTING
    ) {
      console.log(`[TxExecutor] tx BROADCASTING`);

      try {
        // Create a tx copy with signedTx for broadcast
        const txWithSignedTx = { ...tx, signedTx };
        const result = await this.broadcastTx(txWithSignedTx);
        txHash = result.txHash;
        status = BackgroundTxStatus.BROADCASTED;
        console.log(`[TxExecutor] tx broadcasted, txHash:`, txHash);
      } catch (e) {
        console.error(`[TxExecutor] tx broadcast failed:`, e);
        return {
          status: BackgroundTxStatus.FAILED,
          signedTx,
          txHash,
          error: e.message ?? "Transaction broadcasting failed",
        };
      }
    }

    // TRACING
    if (status === BackgroundTxStatus.BROADCASTED) {
      console.log(`[TxExecutor] tx TRACING`);

      try {
        // Create a tx copy with txHash for trace
        const txWithHash = { ...tx, txHash };
        const confirmed = await this.traceTx(txWithHash);
        console.log(`[TxExecutor] tx trace result:`, confirmed);

        if (confirmed) {
          status = BackgroundTxStatus.CONFIRMED;
        } else {
          return {
            status: BackgroundTxStatus.FAILED,
            signedTx,
            txHash,
            error: "Transaction failed",
          };
        }
      } catch (e) {
        console.error(`[TxExecutor] tx trace failed:`, e);
        return {
          status: BackgroundTxStatus.FAILED,
          signedTx,
          txHash,
          error: e.message ?? "Transaction confirmation failed",
        };
      }
    }

    console.log(`[TxExecutor] tx final status:`, status);
    return { status, signedTx, txHash, error };
  }

  protected async signTx(
    vaultId: string,
    tx: BackgroundTx
  ): Promise<{
    signedTx: string;
  }> {
    if (tx.signedTx != null) {
      return {
        signedTx: tx.signedTx,
      };
    }

    if (tx.type === BackgroundTxType.EVM) {
      return this.signEvmTx(vaultId, tx);
    }

    return this.signCosmosTx(vaultId, tx);
  }

  private async signEvmTx(
    vaultId: string,
    tx: EVMBackgroundTx
  ): Promise<{
    signedTx: string;
  }> {
    const keyInfo = await this.keyRingCosmosService.getKey(vaultId, tx.chainId);
    const isHardware = keyInfo.isNanoLedger || keyInfo.isKeystone;
    const signer = keyInfo.ethereumHexAddress;
    const origin =
      typeof browser !== "undefined"
        ? new URL(browser.runtime.getURL("/")).origin
        : "extension";

    // For hardware wallets, the signedTx must be provided externally when calling resumeTx or recordAndExecuteTxs.
    if (isHardware) {
      throw new KeplrError(
        "direct-tx-executor",
        109,
        "Hardware wallet signing should be triggered from user interaction"
      );
    }

    const chainInfo = this.chainsService.getChainInfoOrThrow(tx.chainId);
    const evmInfo = ChainsService.getEVMInfo(chainInfo);
    if (!evmInfo) {
      throw new KeplrError("direct-tx-executor", 113, "Not EVM chain");
    }

    const unsignedTx = await fillUnsignedEVMTx(
      origin,
      evmInfo,
      signer,
      tx.txData,
      tx.feeType ?? "average"
    );

    const result = await this.keyRingEthereumService.signEthereumPreAuthorized(
      vaultId,
      tx.chainId,
      signer,
      Buffer.from(JSON.stringify(unsignedTx)),
      EthSignType.TRANSACTION
    );

    const signedTxData = JSON.parse(Buffer.from(result.signingData).toString());
    const isEIP1559 =
      !!signedTxData.maxFeePerGas || !!signedTxData.maxPriorityFeePerGas;
    if (isEIP1559) {
      signedTxData.type = TransactionTypes.eip1559;
    }

    delete signedTxData.from;

    const signedTx = serialize(signedTxData, result.signature);

    return {
      signedTx: signedTx,
    };
  }

  private async signCosmosTx(
    vaultId: string,
    tx: CosmosBackgroundTx
  ): Promise<{
    signedTx: string;
  }> {
    // check key
    const keyInfo = await this.keyRingCosmosService.getKey(vaultId, tx.chainId);
    const isHardware = keyInfo.isNanoLedger || keyInfo.isKeystone;
    const signer = keyInfo.bech32Address;
    const chainInfo = this.chainsService.getChainInfoOrThrow(tx.chainId);

    const origin =
      typeof browser !== "undefined"
        ? new URL(browser.runtime.getURL("/")).origin
        : "extension";

    const aminoMsgs: Msg[] = tx.txData.aminoMsgs ?? [];
    const protoMsgs: Any[] = tx.txData.protoMsgs;
    const pseudoFee = {
      amount: [
        {
          denom: chainInfo.currencies[0].coinMinimalDenom,
          amount: "1",
        },
      ],
      gas: "100000",
    };
    const memo = tx.txData.memo ?? "";

    // NOTE: 백그라운드에서 자동으로 실행하는 것이므로 편의상 amino로 일관되게 처리한다
    const isDirectSign = aminoMsgs.length === 0;
    if (isDirectSign) {
      throw new KeplrError(
        "direct-tx-executor",
        110,
        "Direct signing is not supported for now"
      );
    }

    if (protoMsgs.length === 0) {
      throw new Error("There is no msg to send");
    }

    if (!isDirectSign && aminoMsgs.length !== protoMsgs.length) {
      throw new Error("The length of aminoMsgs and protoMsgs are different");
    }

    // For hardware wallets, the signedTx must be provided externally when calling resumeTx or recordAndExecuteTxs.
    if (isHardware) {
      throw new KeplrError(
        "direct-tx-executor",
        109,
        "Hardware wallet signing should be triggered from user interaction"
      );
    }

    const account = await BaseAccount.fetchFromRest(
      chainInfo.rest,
      signer,
      true
    );

    const { gasUsed } = await simulateCosmosTx(
      signer,
      chainInfo,
      protoMsgs,
      pseudoFee,
      memo
    );

    const feeCurrency =
      chainInfo.feeCurrencies.find(
        (currency) => currency.coinMinimalDenom === tx.feeCurrencyDenom
      ) ?? chainInfo.currencies[0];

    const { gasPrice } = await getCosmosGasPrice(
      chainInfo,
      tx.feeType ?? "average",
      feeCurrency
    );
    const fee = calculateCosmosStdFee(
      feeCurrency,
      gasUsed,
      gasPrice,
      chainInfo.features
    );

    const signDoc = prepareSignDocForAminoSigning({
      chainInfo,
      accountNumber: account.getAccountNumber().toString(),
      sequence: account.getSequence().toString(),
      aminoMsgs: tx.txData.aminoMsgs ?? [],
      fee,
      memo,
      eip712Signing: false,
      signer,
    });

    const signResponse: AminoSignResponse =
      await this.keyRingCosmosService.signAminoPreAuthorized(
        origin,
        vaultId,
        tx.chainId,
        signer,
        signDoc
      );

    const signedTx = buildSignedTxFromAminoSignResponse({
      protoMsgs,
      signResponse,
      chainInfo,
      eip712Signing: false,
      useEthereumSign: false,
    });

    return { signedTx: Buffer.from(signedTx.tx).toString("base64") };
  }

  protected async broadcastTx(tx: BackgroundTx): Promise<{
    txHash: string;
  }> {
    if (tx.txHash != null) {
      // optimistic assumption here:
      // if the tx hash is set, the transaction is broadcasted successfully
      // do not need to check broadcasted status here
      return {
        txHash: tx.txHash,
      };
    }

    if (tx.type === BackgroundTxType.EVM) {
      return this.broadcastEvmTx(tx);
    }

    return this.broadcastCosmosTx(tx);
  }

  private async broadcastEvmTx(tx: EVMBackgroundTx): Promise<{
    txHash: string;
  }> {
    // assume the signed tx is valid if exists
    if (!tx.signedTx) {
      throw new KeplrError("direct-tx-executor", 108, "Signed tx not found");
    }

    const origin =
      typeof browser !== "undefined"
        ? new URL(browser.runtime.getURL("/")).origin
        : "extension";

    const signedTxBytes = Buffer.from(tx.signedTx.replace("0x", ""), "hex");

    const txHash = await this.backgroundTxEthereumService.sendEthereumTx(
      origin,
      tx.chainId,
      signedTxBytes,
      {
        silent: true,
        skipTracingTxResult: true,
      }
    );

    return {
      txHash,
    };
  }

  private async broadcastCosmosTx(tx: CosmosBackgroundTx): Promise<{
    txHash: string;
  }> {
    if (!tx.signedTx) {
      throw new KeplrError("direct-tx-executor", 108, "Signed tx not found");
    }

    const signedTxBytes = Buffer.from(tx.signedTx, "base64");

    // broadcast the tx
    const txHash = await this.backgroundTxService.sendTx(
      tx.chainId,
      signedTxBytes,
      "sync",
      {
        silent: true,
        skipTracingTxResult: true,
      }
    );

    return {
      txHash: Buffer.from(txHash).toString("hex"),
    };
  }

  protected async traceTx(tx: BackgroundTx): Promise<boolean> {
    if (tx.type === BackgroundTxType.EVM) {
      return this.traceEvmTx(tx);
    }

    return this.traceCosmosTx(tx);
  }

  private async traceEvmTx(tx: EVMBackgroundTx): Promise<boolean> {
    if (!tx.txHash) {
      throw new KeplrError("direct-tx-executor", 108, "Tx hash not found");
    }

    const origin =
      typeof browser !== "undefined"
        ? new URL(browser.runtime.getURL("/")).origin
        : "extension";

    const txReceipt =
      await this.backgroundTxEthereumService.getEthereumTxReceipt(
        origin,
        tx.chainId,
        tx.txHash
      );
    if (!txReceipt) {
      return false;
    }

    return txReceipt.status === EthTxStatus.Success;
  }

  private async traceCosmosTx(tx: CosmosBackgroundTx): Promise<boolean> {
    if (!tx.txHash) {
      throw new KeplrError("direct-tx-executor", 108, "Tx hash not found");
    }

    const txResult = await this.backgroundTxService.traceTx(
      tx.chainId,
      tx.txHash
    );
    if (!txResult) {
      return false;
    }

    // Tendermint/CometBFT omits the code field when tx is successful (code=0)
    // If code is present and non-zero, it's a failure
    if (txResult.code != null && txResult.code !== 0) {
      return false;
    }

    // consider success
    return true;
  }

  /**
   * Find the index of the most recent confirmed transaction with executable chain ids.
   * Returns -1 if not found.
   */
  private findHistoryTxIndex(execution: TxExecution): number {
    if (execution.historyTxIndex != null) {
      return execution.historyTxIndex;
    }
    for (let i = execution.txs.length - 1; i >= 0; i--) {
      const tx = execution.txs[i];
      if (
        execution.executableChainIds.includes(tx.chainId) &&
        tx.status === BackgroundTxStatus.CONFIRMED
      ) {
        return i;
      }
    }
    return -1;
  }

  @action
  protected recordHistoryIfNeeded(execution: TxExecution): void {
    console.log("[TxExecutor] recordHistoryIfNeeded:", {
      type: execution.type,
      historyId: "historyId" in execution ? execution.historyId : undefined,
    });

    if (execution.type === TxExecutionType.UNDEFINED) {
      console.log("[TxExecutor] Skip recording history: UNDEFINED type");
      return;
    }

    if (execution.type === TxExecutionType.SEND) {
      if (execution.hasRecordedHistory || !execution.historyData) {
        return;
      }

      const historyData = execution.historyData;

      this.recentSendHistoryService.addRecentSendHistory(
        historyData.chainId,
        historyData.historyType,
        {
          sender: historyData.sender,
          recipient: historyData.recipient,
          amount: historyData.amount,
          memo: historyData.memo,
          ibcChannels: undefined,
        }
      );

      console.log("[TxExecutor] SEND history recorded");
      execution.hasRecordedHistory = true;
      return;
    }

    if (execution.type === TxExecutionType.IBC_TRANSFER) {
      if (execution.historyId != null || !execution.historyData) {
        console.log(
          "[TxExecutor] Skip IBC_TRANSFER history: already recorded or no data"
        );
        return;
      }

      const historyTxIndex = this.findHistoryTxIndex(execution);
      if (historyTxIndex < 0) {
        return;
      }

      const tx = execution.txs[historyTxIndex];

      // if the tx is not found or not a cosmos tx, skip recording history
      if (!tx || tx.type !== BackgroundTxType.COSMOS) {
        return;
      }

      if (tx.txHash == null) {
        return;
      }

      const historyData = execution.historyData;

      const id = this.recentSendHistoryService.addRecentIBCTransferHistory(
        historyData.sourceChainId,
        historyData.destinationChainId,
        historyData.sender,
        historyData.recipient,
        historyData.amount,
        historyData.memo,
        historyData.channels,
        historyData.notificationInfo,
        Buffer.from(tx.txHash, "hex"),
        execution.id
      );
      this.recentSendHistoryService.trackIBCPacketForwardingRecursive(id);

      console.log("[TxExecutor] IBC_TRANSFER history recorded, id:", id);
      execution.historyId = id;
      return;
    }

    if (execution.type === TxExecutionType.IBC_SWAP) {
      if (execution.historyId != null || !execution.historyData) {
        console.log(
          "[TxExecutor] Skip IBC_SWAP history: already recorded or no data"
        );
        return;
      }

      const historyTxIndex = this.findHistoryTxIndex(execution);
      if (historyTxIndex < 0) {
        return;
      }

      const tx = execution.txs[historyTxIndex];

      // if the tx is not found or not a cosmos tx, skip recording history
      // CHECK: swap on single evm chain should be recorded as history?
      if (!tx || tx.type !== BackgroundTxType.COSMOS) {
        return;
      }

      if (tx.txHash == null) {
        return;
      }

      const historyData = execution.historyData;

      const id = this.recentSendHistoryService.addRecentIBCSwapHistory(
        historyData.swapType,
        historyData.chainId,
        historyData.destinationChainId,
        historyData.sender,
        historyData.amount,
        historyData.memo,
        historyData.ibcChannels,
        historyData.destinationAsset,
        historyData.swapChannelIndex,
        historyData.swapReceiver,
        historyData.notificationInfo,
        Buffer.from(tx.txHash, "hex"),
        execution.id
      );
      this.recentSendHistoryService.trackIBCPacketForwardingRecursive(id);

      console.log("[TxExecutor] IBC_SWAP history recorded, id:", id);
      execution.historyId = id;
      return;
    }

    if (execution.type === TxExecutionType.SWAP_V2) {
      if (execution.historyId != null || !execution.historyData) {
        console.log(
          "[TxExecutor] Skip SWAP_V2 history: already recorded or no data"
        );
        return;
      }

      const historyTxIndex = this.findHistoryTxIndex(execution);
      if (historyTxIndex < 0) {
        return;
      }

      const tx = execution.txs[historyTxIndex];
      if (!tx || tx.txHash == null) {
        return;
      }

      const historyData = execution.historyData;

      const id = this.recentSendHistoryService.recordTxWithSwapV2(
        historyData.fromChainId,
        historyData.toChainId,
        historyData.provider,
        historyData.destinationAsset,
        historyData.simpleRoute,
        historyData.sender,
        historyData.recipient,
        historyData.amount,
        historyData.notificationInfo,
        historyData.routeDurationSeconds,
        tx.txHash,
        historyData.isOnlyUseBridge,
        execution.id
      );

      console.log("[TxExecutor] SWAP_V2 history recorded, id:", id);
      execution.historyId = id;
    }
  }

  /**
   * Get all recent direct transactions executions
   */
  getRecentTxExecutions(): TxExecution[] {
    return Array.from(this.recentTxExecutionMap.values());
  }

  /**
   * Get execution data by ID
   */
  getTxExecution(id: string): TxExecution | undefined {
    const execution = this.recentTxExecutionMap.get(id);
    if (!execution) {
      return undefined;
    }

    return execution;
  }

  /**
   * Cancel execution by execution id
   */
  @action
  async cancelTxExecution(id: string): Promise<void> {
    const execution = this.recentTxExecutionMap.get(id);
    if (!execution) {
      return;
    }

    const currentStatus = execution.status;

    // Only pending/processing/blocked executions can be cancelled
    if (
      currentStatus !== TxExecutionStatus.PENDING &&
      currentStatus !== TxExecutionStatus.PROCESSING &&
      currentStatus !== TxExecutionStatus.BLOCKED
    ) {
      return;
    }

    // CHECK: cancellation is really needed?
    execution.status = TxExecutionStatus.CANCELLED;

    if (currentStatus === TxExecutionStatus.PROCESSING) {
      // TODO: cancel the current transaction execution...
    }
  }

  @action
  protected removeTxExecution(id: string): void {
    this.recentTxExecutionMap.delete(id);
  }

  @action
  protected cleanupOldExecutions(): void {
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7일
    const now = Date.now();

    const completedStatuses = [
      TxExecutionStatus.COMPLETED,
      TxExecutionStatus.FAILED,
      TxExecutionStatus.CANCELLED,
    ];

    for (const [id, execution] of this.recentTxExecutionMap) {
      // 비정상 종료된 PROCESSING 상태 → FAILED 처리
      // (브라우저 종료, 시스템 재부팅, 익스텐션 업데이트 등)
      if (execution.status === TxExecutionStatus.PROCESSING) {
        execution.status = TxExecutionStatus.FAILED;
      }

      const isOld = now - execution.timestamp > maxAge;
      const isDone = completedStatuses.includes(execution.status);

      if (isOld && isDone) {
        this.recentTxExecutionMap.delete(id);
      }
    }
  }
}
