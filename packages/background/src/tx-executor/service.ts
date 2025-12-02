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
  ExecutionFeeType,
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
  EthereumSignResponse,
} from "@keplr-wallet/types";
import { TransactionTypes, serialize } from "@ethersproject/transactions";
import { BaseAccount } from "@keplr-wallet/cosmos";
import { Any } from "@keplr-wallet/proto-types/google/protobuf/any";
import { Msg } from "@keplr-wallet/types";
import {
  getEip712TypedDataBasedOnChainInfo,
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
      const js = toJS(this.recentTxExecutionMap);
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
      // CHECK: 현재 활성화되어 있는 vault에서만 실행할 수 있으면 좋을 듯, how? vaultId 변경 감지? how?
      // 불러왔는데 pending 상태거나 오래된 실행이면 사실상 이 작업을 이어가는 것이 의미가 있는지 의문이 든다.
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
    feeType: ExecutionFeeType = "average",
    historyData?: T extends TxExecutionType.UNDEFINED
      ? undefined
      : ExecutionTypeToHistoryData[T]
  ): Promise<TxExecutionStatus> {
    console.log("[TxExecutor] recordAndExecuteTxs called:", {
      type,
      txCount: txs.length,
      executableChainIds,
      feeType,
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

    // validation for hardware wallets
    if (keyInfo.type === "ledger" || keyInfo.type === "keystone") {
      // at least first tx should be signed with hardware wallet
      // as signing on background is not supported for hardware wallets
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

    // CHECK: 다중 체인 트랜잭션이 아니라면 굳이 이걸 기록할 필요가 있을까?
    // 다중 체인 트랜잭션을 기록하는 이유는 자산 브릿징 등 상당한 시간이 걸리는 경우 이 작업을 백그라운드에서 한없이 기다리는 대신
    // 실행 조건이 만족되었을 때 이어서 실행하기 위함인데, 한 번에 처리가 가능하다면 굳이 이걸 기록할 필요는 없을지도 모른다.
    // 특히나 ui에서 진행상황을 체크하는 것이 아닌 이상 notification을 통해 진행상황을 알리는 것으로 충분할 수 있다.
    const id = (this.recentTxExecutionSeq++).toString();

    const execution = {
      id,
      status: TxExecutionStatus.PENDING,
      vaultId: vaultId,
      txs: txs,
      txIndex: -1,
      executableChainIds: executableChainIds,
      timestamp: Date.now(),
      type,
      feeType,
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
  ): Promise<TxExecutionStatus> {
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
      env,
      txIndex,
      signedTx,
    });
  }

  protected async executeTxs(
    id: string,
    options?: {
      env?: Env;
      txIndex?: number;
      signedTx?: string;
    }
  ): Promise<TxExecutionStatus> {
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
      return execution.status;
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
      console.log(`[TxExecutor] Processing tx[${i}]:`, {
        chainId: execution.txs[i].chainId,
        type: execution.txs[i].type,
        status: execution.txs[i].status,
      });

      let txStatus: BackgroundTxStatus;

      if (options?.txIndex != null && i === options.txIndex) {
        txStatus = await this.executePendingTx(id, i, {
          env: options?.env,
          signedTx: options.signedTx,
        });
      } else {
        txStatus = await this.executePendingTx(id, i, {
          env: options?.env,
        });
      }

      console.log(`[TxExecutor] tx[${i}] result:`, txStatus);

      if (txStatus === BackgroundTxStatus.CONFIRMED) {
        continue;
      }

      // if the tx is blocked, it means multiple transactions are required to be executed on different chains
      // the execution should be stopped and record the history if needed
      // and the execution should be resumed later when the condition is met
      if (txStatus === BackgroundTxStatus.BLOCKED) {
        console.log("[TxExecutor] Execution BLOCKED at tx index:", i);
        runInAction(() => {
          execution.status = TxExecutionStatus.BLOCKED;
        });
        this.recordHistoryIfNeeded(execution);
        return execution.status;
      }

      // if the tx is failed, the execution should be stopped
      if (txStatus === BackgroundTxStatus.FAILED) {
        console.log("[TxExecutor] Execution FAILED at tx index:", i);
        runInAction(() => {
          execution.status = TxExecutionStatus.FAILED;
        });
        return execution.status;
      }

      // something went wrong, should not happen
      throw new KeplrError(
        "direct-tx-executor",
        107,
        "Unexpected tx status: " + txStatus
      );
    }

    // if the execution is completed successfully, update the batch status
    console.log("[TxExecutor] Execution COMPLETED");
    runInAction(() => {
      execution.status = TxExecutionStatus.COMPLETED;
    });
    this.recordHistoryIfNeeded(execution);
    return execution.status;
  }

  protected async executePendingTx(
    id: string,
    index: number,
    options?: {
      env?: Env;
      signedTx?: string;
    }
  ): Promise<BackgroundTxStatus> {
    const execution = this.getTxExecution(id);
    if (!execution) {
      throw new KeplrError("direct-tx-executor", 105, "Execution not found");
    }

    const currentTx = execution.txs[index];
    if (!currentTx) {
      throw new KeplrError("direct-tx-executor", 106, "Tx not found");
    }

    // these statuses are not expected to be reached for pending transactions
    if (
      currentTx.status === BackgroundTxStatus.CONFIRMED ||
      currentTx.status === BackgroundTxStatus.FAILED ||
      currentTx.status === BackgroundTxStatus.CANCELLED
    ) {
      console.log(
        `[TxExecutor] tx[${index}] already in final state:`,
        currentTx.status
      );
      return currentTx.status;
    }

    // update the tx index to the current tx index
    runInAction(() => {
      execution.txIndex = index;
    });

    if (
      currentTx.status === BackgroundTxStatus.BLOCKED ||
      currentTx.status === BackgroundTxStatus.PENDING
    ) {
      // this will be handled with recent send history tracking to check if the condition is met to resume the execution
      // check if the current transaction's chainId is included in the chainIds of the recent send history (might enough with this)
      const isBlocked = !execution.executableChainIds.includes(
        currentTx.chainId
      );
      console.log(`[TxExecutor] tx[${index}] blocked check:`, {
        chainId: currentTx.chainId,
        executableChainIds: execution.executableChainIds,
        isBlocked,
      });

      if (isBlocked) {
        runInAction(() => {
          currentTx.status = BackgroundTxStatus.BLOCKED;
        });
        return currentTx.status;
      } else {
        runInAction(() => {
          currentTx.status = BackgroundTxStatus.SIGNING;
        });
      }
    }

    if (currentTx.status === BackgroundTxStatus.SIGNING) {
      console.log(`[TxExecutor] tx[${index}] SIGNING`);

      // if options are provided, temporary set the options to the current transaction
      if (options?.signedTx) {
        console.log(`[TxExecutor] tx[${index}] using provided signedTx`);
        runInAction(() => {
          currentTx.signedTx = options.signedTx;
        });
      }

      try {
        const { signedTx } = await this.signTx(
          execution.vaultId,
          currentTx,
          execution.feeType,
          options?.env
        );

        console.log(`[TxExecutor] tx[${index}] signed successfully`);
        runInAction(() => {
          currentTx.signedTx = signedTx;
          currentTx.status = BackgroundTxStatus.SIGNED;
        });
      } catch (error) {
        console.error(`[TxExecutor] tx[${index}] signing failed:`, error);
        runInAction(() => {
          currentTx.status = BackgroundTxStatus.FAILED;
          currentTx.error = error.message ?? "Transaction signing failed";
        });
      }
    }

    if (
      currentTx.status === BackgroundTxStatus.SIGNED ||
      currentTx.status === BackgroundTxStatus.BROADCASTING
    ) {
      console.log(`[TxExecutor] tx[${index}] BROADCASTING`);

      try {
        const { txHash } = await this.broadcastTx(currentTx);

        console.log(`[TxExecutor] tx[${index}] broadcasted, txHash:`, txHash);
        runInAction(() => {
          currentTx.txHash = txHash;
          currentTx.status = BackgroundTxStatus.BROADCASTED;
        });
      } catch (error) {
        console.error(`[TxExecutor] tx[${index}] broadcast failed:`, error);
        runInAction(() => {
          currentTx.status = BackgroundTxStatus.FAILED;
          currentTx.error = error.message ?? "Transaction broadcasting failed";
        });
      }
    }

    if (currentTx.status === BackgroundTxStatus.BROADCASTED) {
      console.log(`[TxExecutor] tx[${index}] TRACING`);

      // broadcasted -> confirmed
      try {
        const confirmed = await this.traceTx(currentTx);
        console.log(`[TxExecutor] tx[${index}] trace result:`, confirmed);

        runInAction(() => {
          if (confirmed) {
            currentTx.status = BackgroundTxStatus.CONFIRMED;
          } else {
            currentTx.status = BackgroundTxStatus.FAILED;
            currentTx.error = "Transaction failed";
          }
        });
      } catch (error) {
        console.error(`[TxExecutor] tx[${index}] trace failed:`, error);
        runInAction(() => {
          currentTx.status = BackgroundTxStatus.FAILED;
          currentTx.error = error.message ?? "Transaction confirmation failed";
        });
      }
    }

    console.log(`[TxExecutor] tx[${index}] final status:`, currentTx.status);
    return currentTx.status;
  }

  protected async signTx(
    vaultId: string,
    tx: BackgroundTx,
    feeType: ExecutionFeeType,
    env?: Env
  ): Promise<{
    signedTx: string;
  }> {
    if (tx.signedTx != null) {
      return {
        signedTx: tx.signedTx,
      };
    }

    if (tx.type === BackgroundTxType.EVM) {
      return this.signEvmTx(vaultId, tx, feeType, env);
    }

    return this.signCosmosTx(vaultId, tx, feeType, env);
  }

  private async signEvmTx(
    vaultId: string,
    tx: EVMBackgroundTx,
    feeType: ExecutionFeeType,
    env?: Env
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

    let result: EthereumSignResponse;

    if (isHardware) {
      if (!env) {
        throw new KeplrError(
          "direct-tx-executor",
          109,
          "Hardware wallet signing should be triggered from user interaction"
        );
      }

      result = await this.keyRingEthereumService.signEthereum(
        env,
        origin,
        vaultId,
        tx.chainId,
        signer,
        Buffer.from(JSON.stringify(tx.txData)),
        EthSignType.TRANSACTION
      );
    } else {
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
        feeType
      );

      result = await this.keyRingEthereumService.signEthereumPreAuthorized(
        vaultId,
        tx.chainId,
        signer,
        Buffer.from(JSON.stringify(unsignedTx)),
        EthSignType.TRANSACTION
      );
    }

    // CHECK: does balance check need to be done here?

    const unsignedTx = JSON.parse(Buffer.from(result.signingData).toString());
    const isEIP1559 =
      !!unsignedTx.maxFeePerGas || !!unsignedTx.maxPriorityFeePerGas;
    if (isEIP1559) {
      unsignedTx.type = TransactionTypes.eip1559;
    }

    delete unsignedTx.from;

    const signedTx = serialize(unsignedTx, result.signature);

    return {
      signedTx: signedTx,
    };
  }

  private async signCosmosTx(
    vaultId: string,
    tx: CosmosBackgroundTx,
    feeType: ExecutionFeeType,
    env?: Env
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

    if (isHardware) {
      // hardware wallet signing should be triggered from user interaction
      // so only currently activated key should be used for signing
      if (!env) {
        throw new KeplrError(
          "direct-tx-executor",
          109,
          "Hardware wallet signing should be triggered from user interaction"
        );
      }

      const useEthereumSign =
        chainInfo.features?.includes("eth-key-sign") === true;
      const eip712Signing = useEthereumSign && keyInfo.isNanoLedger;
      if (eip712Signing && !tx.txData.rlpTypes) {
        throw new KeplrError(
          "direct-tx-executor",
          111,
          "RLP types information is needed for signing tx for ethermint chain with ledger"
        );
      }

      if (eip712Signing && isDirectSign) {
        throw new KeplrError(
          "direct-tx-executor",
          112,
          "EIP712 signing is not supported for proto signing"
        );
      }

      // CHECK: what about keystone?

      const account = await BaseAccount.fetchFromRest(
        chainInfo.rest,
        signer,
        true
      );

      const signDoc = prepareSignDocForAminoSigning({
        chainInfo,
        accountNumber: account.getAccountNumber().toString(),
        sequence: account.getSequence().toString(),
        aminoMsgs: tx.txData.aminoMsgs ?? [],
        fee: pseudoFee,
        memo: tx.txData.memo ?? "",
        eip712Signing,
        signer,
      });

      const signResponse: AminoSignResponse = await (async () => {
        if (!eip712Signing) {
          return await this.keyRingCosmosService.signAmino(
            env,
            origin,
            vaultId,
            tx.chainId,
            signer,
            signDoc,
            {}
          );
        }

        return await this.keyRingCosmosService.requestSignEIP712CosmosTx_v0(
          env,
          vaultId,
          origin,
          tx.chainId,
          signer,
          getEip712TypedDataBasedOnChainInfo(chainInfo, {
            aminoMsgs: tx.txData.aminoMsgs ?? [],
            protoMsgs: tx.txData.protoMsgs,
            rlpTypes: tx.txData.rlpTypes,
          }),
          signDoc,
          {}
        );
      })();

      const signedTx = buildSignedTxFromAminoSignResponse({
        protoMsgs,
        signResponse,
        chainInfo,
        eip712Signing,
        useEthereumSign,
      });

      return {
        signedTx: Buffer.from(signedTx.tx).toString("base64"),
      };
    } else {
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
        tx.txData.memo ?? ""
      );

      // TODO: fee token을 사용자가 설정한 것을 사용해야 함
      const { gasPrice } = await getCosmosGasPrice(chainInfo, feeType);
      const fee = calculateCosmosStdFee(
        chainInfo.currencies[0],
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
        memo: tx.txData.memo ?? "",
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
    // check signed tx and signature
    // do not validate the signed tx and signature here just assume it is valid

    // 이렇게 단순하게 처리할 수는 없을 것 같고,
    // serialized tx를 decode해서 signature를 넣고 다시 serialize해서 broadcast하는 방식으로 처리해야 할 듯
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
    if (!txResult || txResult.code == null) {
      return false;
    }

    return txResult.code === 0;
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

      // first tx should be a cosmos tx and it should have a tx hash
      const tx = execution.txs[0];
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

      // first tx should be a cosmos tx and it should have a tx hash
      const tx = execution.txs[0];
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

      // first tx should exist and it should have a tx hash
      const tx = execution.txs[0];
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
