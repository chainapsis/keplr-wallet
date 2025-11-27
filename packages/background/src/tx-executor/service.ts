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
  DirectTxBatch,
  DirectTx,
  DirectTxBatchStatus,
  DirectTxStatus,
  DirectTxBatchType,
  DirectTxBatchBase,
} from "./types";
import {
  action,
  autorun,
  makeObservable,
  observable,
  runInAction,
  toJS,
} from "mobx";

export class BackgroundTxExecutorService {
  @observable
  protected recentDirectTxBatchSeq: number = 0;
  // Key: id (sequence, it should be increased by 1 for each)
  @observable
  protected readonly recentDirectTxBatchMap: Map<string, DirectTxBatch> =
    new Map();

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
    const recentDirectTxBatchSeqSaved = await this.kvStore.get<number>(
      "recentDirectTxBatchSeq"
    );
    if (recentDirectTxBatchSeqSaved) {
      runInAction(() => {
        this.recentDirectTxBatchSeq = recentDirectTxBatchSeqSaved;
      });
    }
    autorun(() => {
      const js = toJS(this.recentDirectTxBatchSeq);
      this.kvStore.set<number>("recentDirectTxBatchSeq", js);
    });

    const recentDirectTxBatchMapSaved = await this.kvStore.get<
      Record<string, DirectTxBatch>
    >("recentDirectTxBatchMap");
    if (recentDirectTxBatchMapSaved) {
      runInAction(() => {
        let entries = Object.entries(recentDirectTxBatchMapSaved);
        entries = entries.sort(([, a], [, b]) => {
          return parseInt(a.id) - parseInt(b.id);
        });
        for (const [key, value] of entries) {
          this.recentDirectTxBatchMap.set(key, value);
        }
      });
    }
    autorun(() => {
      const js = toJS(this.recentDirectTxBatchMap);
      const obj = Object.fromEntries(js);
      this.kvStore.set<Record<string, DirectTxBatch>>(
        "recentDirectTxBatchMap",
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
  recordAndExecuteDirectTxs(
    env: Env,
    vaultId: string,
    type: DirectTxBatchType,
    txs: DirectTx[]
  ): string {
    if (!env.isInternalMsg) {
      throw new KeplrError("direct-tx-executor", 101, "Not internal message");
    }

    const id = (this.recentDirectTxBatchSeq++).toString();

    const batchBase: DirectTxBatchBase = {
      id,
      status: DirectTxBatchStatus.PENDING,
      vaultId: vaultId,
      txs: txs,
      txIndex: -1,
      timestamp: Date.now(),
      // TODO: add swap history data...
    };

    let batch: DirectTxBatch;
    if (type === DirectTxBatchType.SWAP_V2) {
      batch = {
        ...batchBase,
        type: DirectTxBatchType.SWAP_V2,
        // TODO: add swap history data...
        swapHistoryData: {
          chainId: txs[0].chainId,
        },
      };
    } else if (type === DirectTxBatchType.IBC_TRANSFER) {
      batch = {
        ...batchBase,
        type: DirectTxBatchType.IBC_TRANSFER,
        // TODO: add ibc history data...
        ibcHistoryData: {
          chainId: txs[0].chainId,
        },
      };
    } else {
      batch = {
        ...batchBase,
        type: DirectTxBatchType.UNDEFINED,
      };
    }

    this.recentDirectTxBatchMap.set(id, batch);
    this.executeDirectTxs(id);

    return id;
  }

  /**
   * Execute paused direct transactions by execution id and transaction index
   * Tx hash is returned if the transaction is executed successfully
   */
  @action
  async resumeDirectTxs(
    env: Env,
    id: string,
    txIndex: number,
    signedTx?: Uint8Array,
    signature?: Uint8Array
  ): Promise<void> {
    if (!env.isInternalMsg) {
      // TODO: 에러 코드 신경쓰기
      throw new KeplrError("direct-tx-executor", 101, "Not internal message");
    }

    return await this.executeDirectTxs(id, {
      txIndex,
      signedTx,
      signature,
    });
  }

  protected async executeDirectTxs(
    id: string,
    options?: {
      txIndex?: number;
      signedTx?: Uint8Array;
      signature?: Uint8Array;
    }
  ): Promise<void> {
    const batch = this.getDirectTxBatch(id);
    if (!batch) {
      return;
    }

    // Only pending/processing/blocked executions can be executed
    const needResume =
      batch.status === DirectTxBatchStatus.PENDING ||
      batch.status === DirectTxBatchStatus.PROCESSING ||
      batch.status === DirectTxBatchStatus.BLOCKED;
    if (!needResume) {
      return;
    }

    // check if the vault is still valid
    const keyInfo = this.keyRingCosmosService.keyRingService.getKeyInfo(
      batch.vaultId
    );
    if (!keyInfo) {
      throw new KeplrError("direct-tx-executor", 102, "Key info not found");
    }

    const currentTxIndex = Math.min(
      options?.txIndex ?? batch.txIndex < 0 ? 0 : batch.txIndex,
      batch.txs.length - 1
    );
    let nextTxIndex = currentTxIndex;

    const currentTx = batch.txs[currentTxIndex];
    if (!currentTx) {
      throw new KeplrError("direct-tx-executor", 103, "Tx not found");
    }

    if (currentTx.status === DirectTxStatus.CANCELLED) {
      batch.status = DirectTxBatchStatus.CANCELLED;
      return;
    }

    // if the current transaction is in failed status,
    // the execution should be failed and the execution should be stopped
    if (currentTx.status === DirectTxStatus.FAILED) {
      batch.status = DirectTxBatchStatus.FAILED;
      return;
    }

    // if the current transaction is already confirmed,
    // should start the next transaction execution
    if (currentTx.status === DirectTxStatus.CONFIRMED) {
      nextTxIndex = currentTxIndex + 1;
    }

    // if tx index is out of range, the execution should be completed
    if (nextTxIndex >= batch.txs.length) {
      batch.status = DirectTxBatchStatus.COMPLETED;
      this.recordHistoryIfNeeded(batch);
      return;
    }

    if (
      batch.status === DirectTxBatchStatus.PENDING ||
      batch.status === DirectTxBatchStatus.BLOCKED
    ) {
      batch.status = DirectTxBatchStatus.PROCESSING;
    }

    for (let i = nextTxIndex; i < batch.txs.length; i++) {
      let txStatus: DirectTxStatus;

      if (options?.txIndex != null && i === options.txIndex) {
        txStatus = await this.executePendingDirectTx(id, i, {
          signedTx: options.signedTx,
          signature: options.signature,
        });
      } else {
        txStatus = await this.executePendingDirectTx(id, i);
      }

      // if the tx is blocked, the execution should be stopped
      // and the execution should be resumed later when the condition is met
      if (txStatus === DirectTxStatus.BLOCKED) {
        batch.status = DirectTxBatchStatus.BLOCKED;
        return;
      }

      // if the tx is failed, the execution should be stopped
      if (txStatus === DirectTxStatus.FAILED) {
        batch.status = DirectTxBatchStatus.FAILED;
        return;
      }

      // something went wrong...
      if (txStatus !== DirectTxStatus.CONFIRMED) {
        throw new KeplrError("direct-tx-executor", 107, "Unexpected tx status");
      }
    }
  }

  protected async executePendingDirectTx(
    id: string,
    index: number,
    options?: {
      signedTx?: Uint8Array;
      signature?: Uint8Array;
    }
  ): Promise<DirectTxStatus> {
    const batch = this.getDirectTxBatch(id);
    if (!batch) {
      throw new KeplrError("direct-tx-executor", 105, "Execution not found");
    }

    const currentTx = batch.txs[index];
    if (!currentTx) {
      throw new KeplrError("direct-tx-executor", 106, "Tx not found");
    }

    // these statuses are not expected to be reached for pending transactions
    if (
      currentTx.status === DirectTxStatus.CONFIRMED ||
      currentTx.status === DirectTxStatus.FAILED ||
      currentTx.status === DirectTxStatus.CANCELLED
    ) {
      return currentTx.status;
    }

    // update the tx index to the current tx index
    batch.txIndex = index;

    if (
      currentTx.status === DirectTxStatus.BLOCKED ||
      currentTx.status === DirectTxStatus.PENDING
    ) {
      // TODO: check if the condition is met to resume the execution
      // this will be handled with recent send history tracking to check if the condition is met to resume the execution
      // check if the current transaction's chainId is included in the chainIds of the recent send history (might enough with this)
      if (this.checkIfTxIsBlocked(batch, currentTx.chainId)) {
        currentTx.status = DirectTxStatus.BLOCKED;
        return currentTx.status;
      } else {
        currentTx.status = DirectTxStatus.SIGNING;
      }
    }

    if (currentTx.status === DirectTxStatus.SIGNING) {
      // if options are provided, temporary set the options to the current transaction
      if (options?.signedTx && options.signature) {
        currentTx.signedTx = options.signedTx;
        currentTx.signature = options.signature;
      }

      // check if the transaction is signed
      if (this.checkIfTxIsSigned(currentTx)) {
        // if already signed, signing -> signed
        currentTx.status = DirectTxStatus.SIGNED;
      }

      // if not signed, try sign
      if (currentTx.status === DirectTxStatus.SIGNING) {
        try {
          const { signedTx, signature } = await this.signTx(currentTx);

          currentTx.signedTx = signedTx;
          currentTx.signature = signature;
          currentTx.status = DirectTxStatus.SIGNED;
        } catch (error) {
          currentTx.status = DirectTxStatus.FAILED;
          currentTx.error = error.message;
        }
      }
    }

    if (
      currentTx.status === DirectTxStatus.SIGNED ||
      currentTx.status === DirectTxStatus.BROADCASTING
    ) {
      if (currentTx.status === DirectTxStatus.BROADCASTING) {
        // check if the transaction is broadcasted
        if (this.checkIfTxIsBroadcasted(currentTx)) {
          currentTx.status = DirectTxStatus.BROADCASTED;
        }
      } else {
        // set the transaction status to broadcasting
        currentTx.status = DirectTxStatus.BROADCASTING;
      }

      try {
        const { txHash } = await this.broadcastTx(currentTx);

        currentTx.txHash = txHash;
        currentTx.status = DirectTxStatus.BROADCASTED;
      } catch (error) {
        currentTx.status = DirectTxStatus.FAILED;
        currentTx.error = error.message;
      }
    }

    if (currentTx.status === DirectTxStatus.BROADCASTED) {
      // broadcasted -> confirmed

      try {
        const confirmed = await this.checkIfTxIsConfirmed(currentTx);
        if (confirmed) {
          currentTx.status = DirectTxStatus.CONFIRMED;
        } else {
          currentTx.status = DirectTxStatus.FAILED;
          currentTx.error = "Transaction failed";
        }
      } catch (error) {
        currentTx.status = DirectTxStatus.FAILED;
        currentTx.error = error.message;
      }
    }

    if (currentTx.status === DirectTxStatus.CONFIRMED) {
      this.recordHistoryIfNeeded(batch);
    }

    return currentTx.status;
  }

  protected checkIfTxIsBlocked(
    _batch: DirectTxBatch,
    _chainId: string
  ): boolean {
    return false;
  }

  protected checkIfTxIsSigned(_tx: DirectTx): boolean {
    return true;
  }

  protected checkIfTxIsBroadcasted(_tx: DirectTx): boolean {
    return true;
  }

  protected async signTx(_tx: DirectTx): Promise<{
    signedTx: Uint8Array;
    signature: Uint8Array;
  }> {
    return {
      signedTx: new Uint8Array(),
      signature: new Uint8Array(),
    };
  }

  protected async broadcastTx(_tx: DirectTx): Promise<{
    txHash: string;
  }> {
    return {
      txHash: "",
    };
  }

  protected async checkIfTxIsConfirmed(_tx: DirectTx): Promise<boolean> {
    return true;
  }

  protected recordHistoryIfNeeded(_batch: DirectTxBatch): void {
    throw new Error("Not implemented");
  }

  /**
   * Get all recent direct transactions executions
   */
  getRecentDirectTxBatches(): DirectTxBatch[] {
    return Array.from(this.recentDirectTxBatchMap.values());
  }

  /**
   * Get execution data by ID
   */
  getDirectTxBatch(id: string): DirectTxBatch | undefined {
    const batch = this.recentDirectTxBatchMap.get(id);
    if (!batch) {
      return undefined;
    }

    return batch;
  }

  /**
   * Cancel execution by execution id
   */
  @action
  async cancelDirectTxs(id: string): Promise<void> {
    const batch = this.recentDirectTxBatchMap.get(id);
    if (!batch) {
      return;
    }

    const currentStatus = batch.status;

    // Only pending or processing executions can be cancelled
    if (
      currentStatus !== DirectTxBatchStatus.PENDING &&
      currentStatus !== DirectTxBatchStatus.PROCESSING
    ) {
      return;
    }

    // CHECK: cancellation is really needed?
    batch.status = DirectTxBatchStatus.CANCELLED;

    if (currentStatus === DirectTxBatchStatus.PROCESSING) {
      // TODO: cancel the current transaction execution...
    }
  }

  @action
  protected removeDirectTxBatch(id: string): void {
    this.recentDirectTxBatchMap.delete(id);
  }
}
