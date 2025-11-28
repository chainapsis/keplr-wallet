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
  EthSignType,
  EthTxStatus,
  EthereumSignResponse,
} from "@keplr-wallet/types";
import { TransactionTypes, serialize } from "@ethersproject/transactions";

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
    protected readonly recentSendHistoryService: RecentSendHistoryService
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
      Record<string, TxExecution>
    >("recentTxExecutionMap");
    if (recentTxExecutionMapSaved) {
      runInAction(() => {
        let entries = Object.entries(recentTxExecutionMapSaved);
        entries = entries.sort(([, a], [, b]) => {
          return parseInt(a.id) - parseInt(b.id);
        });
        for (const [key, value] of entries) {
          this.recentTxExecutionMap.set(key, value);
        }
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

    // TODO: 간단한 메시지 큐를 구현해서 recent send history service에서 multi tx를 처리할 조건이 만족되었을 때
    // 이 서비스로 메시지를 보내 트랜잭션을 자동으로 실행할 수 있도록 한다. 굳

    // CHECK: 현재 활성화되어 있는 vault에서만 실행할 수 있으면 좋을 듯, how? vaultId 변경 감지? how?
    // CHECK: 굳이 이걸 백그라운드에서 자동으로 실행할 필요가 있을까?
    // 불러왔는데 pending 상태거나 오래된 실행이면 사실상 이 작업을 이어가는 것이 의미가 있는지 의문이 든다.
    // for (const execution of this.getRecentDirectTxsExecutions()) {

    //   this.executeDirectTxs(execution.id);
    // }
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
      : ExecutionTypeToHistoryData[T]
  ): Promise<TxExecutionStatus> {
    if (!env.isInternalMsg) {
      throw new KeplrError("direct-tx-executor", 101, "Not internal message");
    }

    const keyInfo =
      this.keyRingCosmosService.keyRingService.getKeyInfo(vaultId);
    if (!keyInfo) {
      throw new KeplrError("direct-tx-executor", 102, "Key info not found");
    }

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
      ...(type !== TxExecutionType.UNDEFINED ? { historyData } : {}),
    } as TxExecution;

    this.recentTxExecutionMap.set(id, execution);
    return await this.executeTxs(id);
  }

  /**
   * Execute blocked transactions by execution id and transaction index
   */
  @action
  async resumeTx(
    env: Env,
    id: string,
    txIndex?: number,
    signedTx?: Uint8Array
  ): Promise<TxExecutionStatus> {
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
      signedTx?: Uint8Array;
    }
  ): Promise<TxExecutionStatus> {
    const execution = this.getTxExecution(id);
    if (!execution) {
      throw new KeplrError("direct-tx-executor", 105, "Execution not found");
    }

    // Only pending/processing/blocked executions can be executed
    const needResume =
      execution.status === TxExecutionStatus.PENDING ||
      execution.status === TxExecutionStatus.PROCESSING ||
      execution.status === TxExecutionStatus.BLOCKED;
    if (!needResume) {
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
      options?.txIndex ?? execution.txIndex < 0 ? 0 : execution.txIndex,
      execution.txs.length - 1
    );

    execution.status = TxExecutionStatus.PROCESSING;

    for (let i = executionStartIndex; i < execution.txs.length; i++) {
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

      if (txStatus === BackgroundTxStatus.CONFIRMED) {
        continue;
      }

      // if the tx is blocked, it means multiple transactions are required to be executed on different chains
      // the execution should be stopped and record the history if needed
      // and the execution should be resumed later when the condition is met
      if (txStatus === BackgroundTxStatus.BLOCKED) {
        execution.status = TxExecutionStatus.BLOCKED;
        this.recordHistoryIfNeeded(execution);
        return execution.status;
      }

      // if the tx is failed, the execution should be stopped
      if (txStatus === BackgroundTxStatus.FAILED) {
        execution.status = TxExecutionStatus.FAILED;
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
    execution.status = TxExecutionStatus.COMPLETED;
    this.recordHistoryIfNeeded(execution);
    return execution.status;
  }

  protected async executePendingTx(
    id: string,
    index: number,
    options?: {
      env?: Env;
      signedTx?: Uint8Array;
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
      return currentTx.status;
    }

    // update the tx index to the current tx index
    execution.txIndex = index;

    if (
      currentTx.status === BackgroundTxStatus.BLOCKED ||
      currentTx.status === BackgroundTxStatus.PENDING
    ) {
      // TODO: check if the condition is met to resume the execution
      // this will be handled with recent send history tracking to check if the condition is met to resume the execution
      // check if the current transaction's chainId is included in the chainIds of the recent send history (might enough with this)
      const isBlocked = !execution.executableChainIds.includes(
        currentTx.chainId
      );
      if (isBlocked) {
        currentTx.status = BackgroundTxStatus.BLOCKED;
        return currentTx.status;
      } else {
        currentTx.status = BackgroundTxStatus.SIGNING;
      }
    }

    if (currentTx.status === BackgroundTxStatus.SIGNING) {
      // if options are provided, temporary set the options to the current transaction
      if (options?.signedTx) {
        currentTx.signedTx = options.signedTx;
      }

      try {
        const { signedTx } = await this.signTx(
          execution.vaultId,
          currentTx.chainId,
          currentTx,
          options?.env
        );

        currentTx.signedTx = signedTx;
        currentTx.status = BackgroundTxStatus.SIGNED;
      } catch (error) {
        currentTx.status = BackgroundTxStatus.FAILED;
        currentTx.error = error.message ?? "Transaction signing failed";
      }
    }

    if (
      currentTx.status === BackgroundTxStatus.SIGNED ||
      currentTx.status === BackgroundTxStatus.BROADCASTING
    ) {
      try {
        const { txHash } = await this.broadcastTx(currentTx);

        currentTx.txHash = txHash;
        currentTx.status = BackgroundTxStatus.BROADCASTED;
      } catch (error) {
        currentTx.status = BackgroundTxStatus.FAILED;
        currentTx.error = error.message ?? "Transaction broadcasting failed";
      }
    }

    if (currentTx.status === BackgroundTxStatus.BROADCASTED) {
      // broadcasted -> confirmed
      try {
        const confirmed = await this.traceTx(currentTx);
        if (confirmed) {
          currentTx.status = BackgroundTxStatus.CONFIRMED;
        } else {
          currentTx.status = BackgroundTxStatus.FAILED;
          currentTx.error = "Transaction failed";
        }
      } catch (error) {
        currentTx.status = BackgroundTxStatus.FAILED;
        currentTx.error = error.message ?? "Transaction confirmation failed";
      }
    }

    return currentTx.status;
  }

  protected async signTx(
    vaultId: string,
    chainId: string,
    tx: BackgroundTx,
    env?: Env
  ): Promise<{
    signedTx: Uint8Array;
  }> {
    if (tx.signedTx != null) {
      return {
        signedTx: tx.signedTx,
      };
    }

    if (tx.type === BackgroundTxType.EVM) {
      return this.signEvmTx(vaultId, chainId, tx, env);
    }

    return this.signCosmosTx(vaultId, chainId, tx, env);
  }

  private async signEvmTx(
    vaultId: string,
    chainId: string,
    tx: EVMBackgroundTx,
    env?: Env
  ): Promise<{
    signedTx: Uint8Array;
  }> {
    const keyInfo = await this.keyRingCosmosService.getKey(vaultId, chainId);
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
        chainId,
        signer,
        Buffer.from(JSON.stringify(tx.txData)),
        EthSignType.TRANSACTION
      );
    } else {
      result = await this.keyRingEthereumService.signEthereumDirect(
        origin,
        vaultId,
        chainId,
        signer,
        Buffer.from(JSON.stringify(tx.txData)),
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

    const signedTx = Buffer.from(
      serialize(unsignedTx, result.signature).replace("0x", ""),
      "hex"
    );

    return {
      signedTx: signedTx,
    };
  }

  private async signCosmosTx(
    vaultId: string,
    chainId: string,
    tx: CosmosBackgroundTx,
    env?: Env
  ): Promise<{
    signedTx: Uint8Array;
    signature: Uint8Array;
  }> {
    // check key
    const keyInfo = await this.keyRingCosmosService.getKey(vaultId, chainId);
    const isHardware = keyInfo.isNanoLedger || keyInfo.isKeystone;
    const signer = keyInfo.bech32Address;
    const origin =
      typeof browser !== "undefined"
        ? new URL(browser.runtime.getURL("/")).origin
        : "extension";

    // let result: AminoSignResponse;
    if (isHardware) {
      if (!env) {
        throw new KeplrError(
          "direct-tx-executor",
          109,
          "Hardware wallet signing should be triggered from user interaction"
        );
      }

      await this.keyRingCosmosService.signAmino(
        env,
        origin,
        vaultId,
        chainId,
        signer,
        tx.txData,
        {}
      );

      // experimentalSignEIP712CosmosTx_v0 if eip712Signing
    } else {
      throw new KeplrError(
        "direct-tx-executor",
        110,
        "Software wallet signing is not supported"
      );
      // result = await this.keyRingCosmosService.signAminoDirect(
      //   origin,
      //   vaultId,
      //   chainId,
      //   signer,
      //   tx.txData,
      //   {}
      // );
    }

    return {
      signedTx: new Uint8Array(),
      signature: new Uint8Array(),
    };
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

    const txHash = await this.backgroundTxEthereumService.sendEthereumTx(
      origin,
      tx.chainId,
      tx.signedTx,
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

    // broadcast the tx
    const txHash = await this.backgroundTxService.sendTx(
      tx.chainId,
      tx.signedTx,
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

  protected recordHistoryIfNeeded(execution: TxExecution): void {
    if (execution.type === TxExecutionType.UNDEFINED) {
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

      execution.hasRecordedHistory = true;
      return;
    }

    if (execution.type === TxExecutionType.IBC_TRANSFER) {
      if (execution.historyId != null || !execution.historyData) {
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

      // TODO: 기록할 때 execution id를 넘겨줘야 함
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

      execution.historyId = id;
      return;
    }

    if (execution.type === TxExecutionType.IBC_SWAP) {
      if (execution.historyId != null || !execution.historyData) {
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

      execution.historyId = id;
      return;
    }

    if (execution.type === TxExecutionType.SWAP_V2) {
      if (execution.historyId != null || !execution.historyData) {
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

    // Only pending or processing executions can be cancelled
    if (
      currentStatus !== TxExecutionStatus.PENDING &&
      currentStatus !== TxExecutionStatus.PROCESSING
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
}
