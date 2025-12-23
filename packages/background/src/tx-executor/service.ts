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
  IBCSwapMinimalTrackingData,
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
import { TxRaw } from "@keplr-wallet/proto-types/cosmos/tx/v1beta1/tx";
import { Msg } from "@keplr-wallet/types";
import {
  buildSignedTxFromAminoSignResponse,
  prepareSignDocForAminoSigning,
  simulateCosmosTx,
  getCosmosGasPrice,
  calculateCosmosStdFee,
  prepareSignDocForDirectSigning,
} from "./utils/cosmos";
import { fillUnsignedEVMTx } from "./utils/evm";
import { EventBusSubscriber } from "@keplr-wallet/common";
import { TxExecutionEvent } from "./types";

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
    protected readonly subscriber: EventBusSubscriber<TxExecutionEvent>
  ) {
    makeObservable(this);
  }

  async init(): Promise<void> {
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
      Record<string, string>
    >("recentSerializedTxExecutionMap");
    if (recentTxExecutionMapSaved) {
      runInAction(() => {
        const entries = Object.entries(recentTxExecutionMapSaved);
        const sorted = entries
          .map(([key, value]) => [key, JSON.parse(value)])
          .sort(([, a], [, b]) => parseInt(a.id) - parseInt(b.id));

        for (const [key, execution] of sorted) {
          this.recentTxExecutionMap.set(key, execution);
        }

        this.cleanupOldExecutions();
      });
    }
    autorun(() => {
      const js = toJS(this.recentTxExecutionMap);
      const serialized: Record<string, string> = {};
      for (const [key, value] of js) {
        // only persist executions that are BLOCKED
        if (value.status === TxExecutionStatus.BLOCKED) {
          serialized[key] = JSON.stringify(value);
        }
      }

      this.kvStore
        .set<Record<string, string>>(
          "recentSerializedTxExecutionMap",
          serialized
        )
        .catch((e) => {
          console.error("[TxExecutor] kvStore save failed:", e);
        });
    });

    this.subscriber.subscribe((event) => this.handleTxExecutionEvent(event));
  }

  @action
  protected handleTxExecutionEvent(event: TxExecutionEvent): void {
    if (event.type === "remove") {
      this.removeTxExecution(event.executionId);
      return;
    }

    const { executionId, executableChainIds } = event;

    const execution = this.getTxExecution(executionId);
    if (!execution) {
      return;
    }

    const newExecutableChainIds = executableChainIds.filter(
      (chainId) => !execution.executableChainIds.includes(chainId)
    );

    if (newExecutableChainIds.length === 0) {
      return;
    }

    // update the executable chain ids
    execution.executableChainIds = Array.from(
      new Set([...execution.executableChainIds, ...newExecutableChainIds])
    );

    // if there is a pending tx that is executable, force display the swap v2 history
    if (
      execution.type === TxExecutionType.SWAP_V2 &&
      execution.historyId != null
    ) {
      const hasExecutableTx = execution.txs.some(
        (tx) =>
          (tx.status === BackgroundTxStatus.PENDING ||
            tx.status === BackgroundTxStatus.BLOCKED) &&
          execution.executableChainIds.includes(tx.chainId)
      );
      if (hasExecutableTx) {
        this.recentSendHistoryService.showSwapV2History(execution.historyId);
      }
    }
  }

  async recordAndExecuteTxs<T extends TxExecutionType>(
    env: Env,
    vaultId: string,
    type: T,
    txs: (BackgroundTx & {
      status: BackgroundTxStatus.PENDING | BackgroundTxStatus.CONFIRMED;
    })[],
    executableChainIds: string[],
    historyData?: T extends TxExecutionType.UNDEFINED
      ? undefined
      : ExecutionTypeToHistoryData[T],
    historyTxIndex?: number
  ): Promise<TxExecutionResult> {
    if (!env.isInternalMsg) {
      throw new KeplrError("direct-tx-executor", 101, "Not internal message");
    }

    const keyInfo =
      this.keyRingCosmosService.keyRingService.getKeyInfo(vaultId);
    if (!keyInfo) {
      throw new KeplrError("direct-tx-executor", 120, "Key info not found");
    }

    // If any of the transactions are not executable or the key is hardware wallet,
    // auto sign is disabled.
    const preventAutoSign =
      txs.some((tx) => !executableChainIds.includes(tx.chainId)) ||
      keyInfo.type === "ledger" ||
      keyInfo.type === "keystone";

    /**
     * If preventAutoSign is true, at least one executable transaction must already be signed.
     * For example, in an EVM bundle (like ERC20 approve + swap) where simulation is not possible,
     * the UI might execute 'approve' (tx[0]) first and set its txHash, then sign the swap (tx[1]).
     * Both tx[0] and tx[1] are executable, but tx[0] has already been executed and doesn't need to be signed again.
     * So, ensure that at least one executable tx is already signed before proceeding.
     */
    if (preventAutoSign) {
      const executableTxs = txs.filter((tx) =>
        executableChainIds.includes(tx.chainId)
      );

      if (executableTxs.length === 0) {
        throw new KeplrError("direct-tx-executor", 122, "No executable txs");
      }

      if (executableTxs.every((tx) => tx.signedTx == null)) {
        throw new KeplrError(
          "direct-tx-executor",
          123,
          "No signed txs found with preventAutoSign"
        );
      }
    }

    const id = runInAction(() => {
      return (this.recentTxExecutionSeq++).toString();
    });

    const execution = {
      id,
      status: TxExecutionStatus.PENDING,
      vaultId: vaultId,
      txs,
      txIndex: -1,
      executableChainIds: executableChainIds,
      timestamp: Date.now(),
      type,
      preventAutoSign,
      historyTxIndex,
      ...(type !== TxExecutionType.UNDEFINED ? { historyData } : {}),
    } as TxExecution;

    runInAction(() => {
      this.recentTxExecutionMap.set(id, execution);
    });

    return await this.executeTxs(id);
  }

  /**
   * Execute blocked transactions by execution id and transaction index
   */
  async resumeTx(
    env: Env,
    id: string,
    txIndex: number,
    signedTx: string,
    ibcSwapData?: IBCSwapMinimalTrackingData
  ): Promise<TxExecutionResult> {
    if (!env.isInternalMsg) {
      throw new KeplrError("direct-tx-executor", 101, "Not internal message");
    }

    return await this.executeTxs(id, {
      txIndex,
      signedTx,
      ibcSwapData,
    });
  }

  protected async executeTxs(
    id: string,
    options?: {
      txIndex?: number;
      signedTx?: string;
      ibcSwapData?: IBCSwapMinimalTrackingData;
    }
  ): Promise<TxExecutionResult> {
    const execution = this.getTxExecution(id);
    if (!execution) {
      throw new KeplrError("direct-tx-executor", 121, "Execution not found");
    }

    if (execution.status === TxExecutionStatus.PROCESSING) {
      throw new KeplrError(
        "direct-tx-executor",
        130,
        "Execution is already processing"
      );
    }

    // Only pending or blocked executions can be executed
    const needExecute =
      execution.status === TxExecutionStatus.PENDING ||
      execution.status === TxExecutionStatus.BLOCKED;
    if (!needExecute) {
      return {
        status: execution.status,
      };
    }

    const keyInfo = this.keyRingCosmosService.keyRingService.getKeyInfo(
      execution.vaultId
    );
    if (!keyInfo) {
      throw new KeplrError("direct-tx-executor", 120, "Key info not found");
    }

    const executionStartIndex = Math.min(
      options?.txIndex ?? (execution.txIndex < 0 ? 0 : execution.txIndex),
      execution.txs.length - 1
    );

    runInAction(() => {
      execution.status = TxExecutionStatus.PROCESSING;
    });

    for (let i = executionStartIndex; i < execution.txs.length; i++) {
      const currentTx = execution.txs[i];

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

      // update the tx status and related fields
      runInAction(() => {
        execution.txIndex = i;
        currentTx.status = result.status;
        if (result.txHash != null) {
          currentTx.txHash = result.txHash;
        }
        if (result.error != null) {
          currentTx.error = result.error;
        }
        currentTx.signedTx = undefined;
      });

      switch (result.status) {
        case BackgroundTxStatus.CONFIRMED: {
          if (providedSignedTx) {
            // 외부에서 제공된 signed tx로 실행한 경우 (= multi tx 재개 케이스)
            //
            // 이번에 처리된 트랜잭션이 multi tx swap의 마지막 트랜잭션이라고 optimistically 가정하고,
            // 추가적인 히스토리 데이터를 기록해야 한다.
            //
            // [배경]
            // Skip에서 기본적으로 smart relay 기능을 활성화해 놓았으므로,
            // multi tx swap이 필요한 경우는 다음과 같다:
            //   - A 체인에서 브릿지, 메시징 프로토콜, 또는 IBC Eureka를 통해 B 체인으로 자산을 전송
            //   - B 체인에서 사용자 주소로 릴리즈되는 자산이 wrapped asset이거나 IBC swap이 필요한 asset
            //
            // [마지막 트랜잭션의 유형]
            // 따라서 multi tx swap의 마지막 트랜잭션은 아래 두 가지 중 하나라고 가정할 수 있다:
            //   1. Wrapped asset → Native asset 변환 트랜잭션 (EVM)
            //   2. IBC swap이 필요한 asset의 IBC swap 트랜잭션 (Cosmos)
            //
            // [트랜잭션 타입별 처리]
            //   1. EVM: txHash를 additionalTrackingData에 저장 → debug_traceTransaction으로 추적
            //   2. Cosmos: 외부에서 IBC swap data를 받아 additionalTrackingData에 저장 → IBC swap tracking
            if (
              execution.type === TxExecutionType.SWAP_V2 &&
              execution.historyId != null
            ) {
              const currentTx = execution.txs[i];
              switch (currentTx.type) {
                case BackgroundTxType.EVM: {
                  if (result.txHash != null) {
                    this.recentSendHistoryService.setSwapV2AdditionalTrackingData(
                      execution.historyId,
                      {
                        type: "evm",
                        chainId: currentTx.chainId,
                        txHash: result.txHash,
                      }
                    );
                  }
                  break;
                }
                case BackgroundTxType.COSMOS: {
                  const ibcSwapData = options?.ibcSwapData;
                  if (ibcSwapData != null && result.txHash != null) {
                    this.recentSendHistoryService.setSwapV2AdditionalTrackingData(
                      execution.historyId,
                      { type: "cosmos-ibc", ibcSwapData, txHash: result.txHash }
                    );
                  }
                  break;
                }
                default: {
                  // noop
                  break;
                }
              }
            }
          }
          continue;
        }
        case BackgroundTxStatus.FAILED: {
          this.recordSwapV2HistoryErrorIfNeeded(
            execution,
            result.error ?? `${i + 1}th transaction failed`
          );
          this.removeTxExecution(id);

          return {
            status: TxExecutionStatus.FAILED,
            error: result.error,
          };
        }
        case BackgroundTxStatus.BLOCKED: {
          /**
           * If the tx is BLOCKED, it means multiple transactions are required
           * to be executed on different chains.
           *
           * - The execution should be stopped here,
           * - Record the history if needed,
           * - The execution should be resumed later when the condition is met.
           */
          runInAction(() => {
            execution.status = TxExecutionStatus.BLOCKED;
            this.recordHistoryIfNeeded(execution);

            // no need to keep the history data anymore
            delete execution.historyData;
          });

          return {
            status: TxExecutionStatus.BLOCKED,
          };
        }
        default: {
          throw new KeplrError(
            "direct-tx-executor",
            131,
            "Unexpected tx status: " + result.status
          );
        }
      }
    }

    this.recordHistoryIfNeeded(execution);
    this.clearSwapV2HistoryBackgroundExecutionIdIfNeeded(execution);
    this.removeTxExecution(id);

    return {
      status: TxExecutionStatus.COMPLETED,
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
    const status = tx.status;
    let signedTx = tx.signedTx ?? providedSignedTx;
    let txHash = tx.txHash;
    let error: string | undefined;

    // Already in final state
    if (
      status === BackgroundTxStatus.CONFIRMED ||
      status === BackgroundTxStatus.FAILED
    ) {
      return { status, txHash, error };
    }

    // Check if blocked
    const isBlocked = !executableChainIds.includes(tx.chainId);
    if (isBlocked) {
      return { status: BackgroundTxStatus.BLOCKED, txHash, error };
    }

    // If preventAutoSign and not signed, block
    if (preventAutoSign && signedTx == null) {
      return { status: BackgroundTxStatus.BLOCKED, txHash, error };
    }

    // if not signed, sign the tx
    if (signedTx == null) {
      try {
        const signResult = await this.signTx(vaultId, tx);
        signedTx = signResult;
      } catch (e) {
        console.error(`[TxExecutor] tx signing failed:`, e);
        return {
          status: BackgroundTxStatus.FAILED,
          txHash,
          error: e.message ?? "Transaction signing failed",
        };
      }
    }

    // if tx hash is not set, broadcast the tx
    if (txHash == null) {
      try {
        const txWithSignedTx = { ...tx, signedTx };
        const broadcastResult = await this.broadcastTx(txWithSignedTx);
        txHash = broadcastResult;
      } catch (e) {
        console.error(`[TxExecutor] tx broadcast failed:`, e);

        return {
          status: BackgroundTxStatus.FAILED,
          txHash,
          error: e.message ?? "Transaction broadcasting failed",
        };
      }
    }

    // trace the tx
    try {
      const txWithHash = { ...tx, txHash };
      const confirmed = await this.traceTx(txWithHash);

      if (confirmed) {
        return { status: BackgroundTxStatus.CONFIRMED, txHash };
      }

      return {
        status: BackgroundTxStatus.FAILED,
        txHash,
        error: "Transaction confirmation failed",
      };
    } catch (e) {
      console.error(`[TxExecutor] tx trace failed:`, e);
      return {
        status: BackgroundTxStatus.FAILED,
        txHash,
        error: e.message ?? "Transaction confirmation failed",
      };
    }
  }

  protected async signTx(vaultId: string, tx: BackgroundTx): Promise<string> {
    switch (tx.type) {
      case BackgroundTxType.EVM: {
        return this.signEvmTx(vaultId, tx);
      }
      case BackgroundTxType.COSMOS: {
        return this.signCosmosTx(vaultId, tx);
      }
      default: {
        throw new KeplrError("direct-tx-executor", 143, "Unknown tx type");
      }
    }
  }

  private async signEvmTx(
    vaultId: string,
    tx: EVMBackgroundTx
  ): Promise<string> {
    const keyInfo = await this.keyRingCosmosService.getKey(vaultId, tx.chainId);
    const isHardware = keyInfo.isNanoLedger || keyInfo.isKeystone;
    const signer = keyInfo.ethereumHexAddress;

    // For hardware wallets, the signedTx must be provided externally when calling resumeTx or recordAndExecuteTxs.
    if (isHardware) {
      throw new KeplrError(
        "direct-tx-executor",
        140,
        "Hardware wallet signing should be triggered from user interaction"
      );
    }

    const origin =
      typeof browser !== "undefined"
        ? new URL(browser.runtime.getURL("/")).origin
        : "extension";
    const chainInfo = this.chainsService.getChainInfoOrThrow(tx.chainId);
    const evmInfo = ChainsService.getEVMInfo(chainInfo);
    if (!evmInfo) {
      throw new KeplrError("direct-tx-executor", 142, "Not EVM chain");
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

    return serialize(signedTxData, result.signature);
  }

  private async signCosmosTx(
    vaultId: string,
    tx: CosmosBackgroundTx
  ): Promise<string> {
    const keyInfo = await this.keyRingCosmosService.getKey(vaultId, tx.chainId);
    const isHardware = keyInfo.isNanoLedger || keyInfo.isKeystone;
    const signer = keyInfo.bech32Address;

    // For hardware wallets, the signedTx must be provided externally when calling resumeTx or recordAndExecuteTxs.
    if (isHardware) {
      throw new KeplrError(
        "direct-tx-executor",
        140,
        "Hardware wallet signing should be triggered from user interaction"
      );
    }

    const origin =
      typeof browser !== "undefined"
        ? new URL(browser.runtime.getURL("/")).origin
        : "extension";
    const chainInfo = this.chainsService.getChainInfoOrThrow(tx.chainId);

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

    const isDirectSign = aminoMsgs.length === 0;

    if (protoMsgs.length === 0) {
      throw new Error("There is no msg to send");
    }

    if (!isDirectSign && aminoMsgs.length !== protoMsgs.length) {
      throw new Error("The length of aminoMsgs and protoMsgs are different");
    }

    const account = await BaseAccount.fetchFromRest(
      chainInfo.rest,
      signer,
      true
    );

    let fee = tx.txData.fee; // use provided fee if exists
    if (fee == null) {
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
      fee = calculateCosmosStdFee(
        feeCurrency,
        gasUsed,
        gasPrice,
        chainInfo.features
      );
    }

    if (isDirectSign) {
      const { signDoc, bodyBytes, authInfoBytes } =
        prepareSignDocForDirectSigning({
          chainInfo,
          accountNumber: account.getAccountNumber().toString(),
          sequence: account.getSequence().toString(),
          protoMsgs,
          fee,
          memo,
          pubKey: keyInfo.pubKey,
        });

      const { signature } =
        await this.keyRingCosmosService.signDirectPreAuthorized(
          origin,
          vaultId,
          tx.chainId,
          signer,
          signDoc
        );

      const signedTx = TxRaw.encode({
        bodyBytes,
        authInfoBytes,
        signatures: [Buffer.from(signature.signature, "base64")],
      }).finish();

      return Buffer.from(signedTx).toString("base64");
    } else {
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
      });

      return Buffer.from(signedTx.tx).toString("base64");
    }
  }

  protected async broadcastTx(tx: BackgroundTx): Promise<string> {
    switch (tx.type) {
      case BackgroundTxType.EVM: {
        return this.broadcastEvmTx(tx);
      }
      case BackgroundTxType.COSMOS: {
        return this.broadcastCosmosTx(tx);
      }
      default: {
        throw new KeplrError("direct-tx-executor", 143, "Unknown tx type");
      }
    }
  }

  private async broadcastEvmTx(tx: EVMBackgroundTx): Promise<string> {
    // assume the signed tx is valid if exists
    if (!tx.signedTx) {
      throw new KeplrError("direct-tx-executor", 132, "Signed tx not found");
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

    return txHash;
  }

  private async broadcastCosmosTx(tx: CosmosBackgroundTx): Promise<string> {
    if (!tx.signedTx) {
      throw new KeplrError("direct-tx-executor", 132, "Signed tx not found");
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

    return Buffer.from(txHash).toString("hex");
  }

  protected async traceTx(tx: BackgroundTx): Promise<boolean> {
    switch (tx.type) {
      case BackgroundTxType.EVM: {
        return this.traceEvmTx(tx);
      }
      case BackgroundTxType.COSMOS: {
        return this.traceCosmosTx(tx);
      }
      default: {
        throw new KeplrError("direct-tx-executor", 143, "Unknown tx type");
      }
    }
  }

  private async traceEvmTx(tx: EVMBackgroundTx): Promise<boolean> {
    if (!tx.txHash) {
      throw new KeplrError("direct-tx-executor", 133, "Tx hash not found");
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
      throw new KeplrError("direct-tx-executor", 133, "Tx hash not found");
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
    switch (execution.type) {
      case TxExecutionType.IBC_TRANSFER: {
        if (execution.historyId != null || execution.historyData == null) {
          return;
        }

        const historyTxIndex = this.findHistoryTxIndex(execution);
        if (historyTxIndex < 0) {
          return;
        }

        const tx = execution.txs[historyTxIndex];
        if (!tx || tx.type !== BackgroundTxType.COSMOS || tx.txHash == null) {
          return;
        }

        const historyData = execution.historyData;

        const backgroundExecutionId = execution.txs.some(
          (tx) => tx.status === BackgroundTxStatus.BLOCKED
        )
          ? execution.id
          : undefined;

        const id =
          this.recentSendHistoryService.addRecentIBCTransferHistoryWithTracking(
            historyData.sourceChainId,
            historyData.destinationChainId,
            historyData.sender,
            historyData.recipient,
            historyData.amount,
            historyData.memo,
            historyData.channels,
            historyData.notificationInfo,
            Buffer.from(tx.txHash, "hex"),
            backgroundExecutionId
          );

        execution.historyId = id;
        break;
      }
      case TxExecutionType.IBC_SWAP: {
        if (execution.historyId != null || execution.historyData == null) {
          return;
        }

        const historyTxIndex = this.findHistoryTxIndex(execution);
        if (historyTxIndex < 0) {
          return;
        }

        const tx = execution.txs[historyTxIndex];
        if (!tx || tx.type !== BackgroundTxType.COSMOS || tx.txHash == null) {
          return;
        }

        const historyData = execution.historyData;

        const backgroundExecutionId = execution.txs.some(
          (tx) => tx.status === BackgroundTxStatus.BLOCKED
        )
          ? execution.id
          : undefined;

        const id =
          this.recentSendHistoryService.addRecentIBCSwapHistoryWithTracking(
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
            backgroundExecutionId
          );

        execution.historyId = id;
        break;
      }
      case TxExecutionType.SWAP_V2: {
        if (execution.historyId != null || execution.historyData == null) {
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

        const backgroundExecutionId = execution.txs.some(
          (tx) => tx.status === BackgroundTxStatus.BLOCKED
        )
          ? execution.id
          : undefined;

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
          backgroundExecutionId
        );

        execution.historyId = id;
        break;
      }
      default: {
        return;
      }
    }
  }

  getRecentTxExecutions(): TxExecution[] {
    return Array.from(this.recentTxExecutionMap.values());
  }

  getTxExecution(id: string): TxExecution | undefined {
    const execution = this.recentTxExecutionMap.get(id);
    if (!execution) {
      return undefined;
    }

    return execution;
  }

  @action
  protected removeTxExecution(id: string): void {
    this.recentTxExecutionMap.delete(id);
  }

  @action
  protected cleanupOldExecutions(): void {
    const completedStatuses = [
      TxExecutionStatus.COMPLETED,
      TxExecutionStatus.FAILED,
    ];

    const idsToDelete: string[] = [];

    for (const [id, execution] of this.recentTxExecutionMap) {
      // 비정상 종료된 PROCESSING 상태 → FAILED 처리
      // (브라우저 종료, 시스템 재부팅, 익스텐션 업데이트 등)
      if (execution.status === TxExecutionStatus.PROCESSING) {
        execution.status = TxExecutionStatus.FAILED;
      }

      if (completedStatuses.includes(execution.status)) {
        idsToDelete.push(id);
      }
    }

    for (const id of idsToDelete) {
      this.recentTxExecutionMap.delete(id);
    }
  }

  private recordSwapV2HistoryErrorIfNeeded(
    execution: TxExecution,
    error: string
  ): void {
    if (
      execution.type === TxExecutionType.SWAP_V2 &&
      execution.historyId != null
    ) {
      this.recentSendHistoryService.setSwapV2HistoryError(
        execution.historyId,
        error
      );
    }
  }

  private clearSwapV2HistoryBackgroundExecutionIdIfNeeded(
    execution: TxExecution
  ): void {
    if (
      execution.type === TxExecutionType.SWAP_V2 &&
      execution.historyId != null
    ) {
      this.recentSendHistoryService.clearSwapV2HistoryBackgroundExecutionId(
        execution.historyId
      );
    }
  }
}
