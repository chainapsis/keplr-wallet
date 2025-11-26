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
  DirectTxsBatch,
  DirectTxsBatchResult,
  DirectTx,
  DirectTxsBatchStatus,
  DirectTxStatus,
} from "./types";
import {
  action,
  autorun,
  makeObservable,
  observable,
  runInAction,
  toJS,
} from "mobx";

// TODO: implement this service
export class BackgroundTxExecutorService {
  @observable
  protected recentDirectTxsBatchesSeq: number = 0;
  // Key: id (sequence, it should be increased by 1 for each)
  @observable
  protected readonly recentDirectTxsBatchesMap: Map<string, DirectTxsBatch> =
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
    const recentDirectTxsBatchesSeqSaved = await this.kvStore.get<number>(
      "recentDirectTxsBatchesSeq"
    );
    if (recentDirectTxsBatchesSeqSaved) {
      runInAction(() => {
        this.recentDirectTxsBatchesSeq = recentDirectTxsBatchesSeqSaved;
      });
    }
    autorun(() => {
      const js = toJS(this.recentDirectTxsBatchesSeq);
      this.kvStore.set<number>("recentDirectTxsBatchesSeq", js);
    });

    const recentDirectTxsBatchesMapSaved = await this.kvStore.get<
      Record<string, DirectTxsBatch>
    >("recentDirectTxsBatchesMap");
    if (recentDirectTxsBatchesMapSaved) {
      runInAction(() => {
        let entries = Object.entries(recentDirectTxsBatchesMapSaved);
        entries = entries.sort(([, a], [, b]) => {
          return parseInt(a.id) - parseInt(b.id);
        });
        for (const [key, value] of entries) {
          this.recentDirectTxsBatchesMap.set(key, value);
        }
      });
    }
    autorun(() => {
      const js = toJS(this.recentDirectTxsBatchesMap);
      const obj = Object.fromEntries(js);
      this.kvStore.set<Record<string, DirectTxsBatch>>(
        "recentDirectTxsBatchesMap",
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
    txs: DirectTx[]
  ): string {
    if (!env.isInternalMsg) {
      throw new KeplrError("direct-tx-executor", 101, "Not internal message");
    }

    const id = (this.recentDirectTxsBatchesSeq++).toString();

    const batch: DirectTxsBatch = {
      id,
      status: DirectTxsBatchStatus.PENDING,
      vaultId: vaultId,
      txs: txs,
      txIndex: -1,
      timestamp: Date.now(),
      // TODO: add swap history data...
    };

    this.recentDirectTxsBatchesMap.set(id, batch);
    this.executeDirectTxs(id);

    return id;
  }

  /**
   * Execute single specific transaction by execution id and transaction index
   * Tx hash is returned if the transaction is executed successfully
   */
  async resumeDirectTxs(
    env: Env,
    _id: string,
    _vaultId: string,
    _txIndex: number,
    _signedTx?: Uint8Array,
    _signature?: Uint8Array
  ): Promise<void> {
    if (!env.isInternalMsg) {
      // TODO: 에러 코드 신경쓰기
      throw new KeplrError("direct-tx-executor", 101, "Not internal message");
    }

    // TODO: implement
    throw new Error("Not implemented");
  }

  protected async executeDirectTxs(id: string): Promise<void> {
    const batch = this.getDirectTxsBatch(id);
    if (!batch) {
      return;
    }

    // Only pending or processing executions can be executed
    const needContinue =
      batch.status === DirectTxsBatchStatus.PENDING ||
      batch.status === DirectTxsBatchStatus.PROCESSING;

    if (!needContinue) {
      return;
    }

    // check if the vault is still valid
    const keyInfo = this.keyRingCosmosService.keyRingService.getKeyInfo(
      batch.vaultId
    );
    if (!keyInfo) {
      throw new KeplrError("direct-tx-executor", 102, "Key info not found");
    }

    const txIndex = Math.min(
      batch.txIndex < 0 ? 0 : batch.txIndex,
      batch.txs.length - 1
    );
    let nextTxIndex = txIndex;

    const currentTx = batch.txs[txIndex];
    if (!currentTx) {
      throw new KeplrError("direct-tx-executor", 103, "Tx not found");
    }

    if (currentTx.status === DirectTxStatus.CANCELLED) {
      batch.status = DirectTxsBatchStatus.CANCELLED;
      return;
    }

    // if the current transaction is in failed/reverted status,
    // the execution should be failed and the execution should be stopped
    if (
      currentTx.status === DirectTxStatus.FAILED ||
      currentTx.status === DirectTxStatus.REVERTED
    ) {
      batch.status = DirectTxsBatchStatus.FAILED;
      return;
    }

    // if the current transaction is already confirmed,
    // should start the next transaction execution
    if (currentTx.status === DirectTxStatus.CONFIRMED) {
      nextTxIndex = txIndex + 1;
    }

    // if tx index is out of range, the execution should be completed
    if (nextTxIndex >= batch.txs.length) {
      batch.status = DirectTxsBatchStatus.COMPLETED;
      // TODO: record swap history if needed
      return;
    }

    if (batch.status === DirectTxsBatchStatus.PENDING) {
      batch.status = DirectTxsBatchStatus.PROCESSING;
    }

    for (let i = txIndex; i < batch.txs.length; i++) {
      // CHECK: multi tx 케이스인 경우, 연속해서 실행할 수 없는 상황이 발생할 수 있음...
      await this.executePendingDirectTx(id, i);
    }
  }

  protected async executePendingDirectTx(
    id: string,
    index: number
  ): Promise<void> {
    const batch = this.getDirectTxsBatch(id);
    if (!batch) {
      throw new KeplrError("direct-tx-executor", 105, "Execution not found");
    }

    const currentTx = batch.txs[index];
    if (!currentTx) {
      throw new KeplrError("direct-tx-executor", 106, "Tx not found");
    }

    if (currentTx.status === DirectTxStatus.CONFIRMED) {
      return;
    }

    // these statuses are not expected to be reached for pending transactions
    if (
      currentTx.status === DirectTxStatus.FAILED ||
      currentTx.status === DirectTxStatus.REVERTED ||
      currentTx.status === DirectTxStatus.CANCELLED
    ) {
      throw new KeplrError(
        "direct-tx-executor",
        107,
        `Unexpected tx status when executing pending transaction: ${currentTx.status}`
      );
    }

    // update the tx index to the current tx index
    batch.txIndex = index;

    // 순서대로 signing -> broadcasting -> checking receipt 순으로 진행된다.

    // 1. signing
    if (
      currentTx.status === DirectTxStatus.PENDING ||
      currentTx.status === DirectTxStatus.SIGNING
    ) {
      if (currentTx.status === DirectTxStatus.SIGNING) {
        // check if the transaction is signed
        // if not, try sign again...
      } else {
        // set the transaction status to signing
        currentTx.status = DirectTxStatus.SIGNING;
      }

      try {
        // sign the transaction

        // if success, set the transaction status to signed
        currentTx.status = DirectTxStatus.SIGNED;
      } catch (error) {
        currentTx.status = DirectTxStatus.FAILED;
        currentTx.error = error.message;
      }
    }

    // 2. broadcasting
    if (
      currentTx.status === DirectTxStatus.SIGNED ||
      currentTx.status === DirectTxStatus.BROADCASTING
    ) {
      if (currentTx.status === DirectTxStatus.BROADCASTING) {
        // check if the transaction is broadcasted
        // if not, try broadcast again...
      } else {
        // set the transaction status to broadcasting
        currentTx.status = DirectTxStatus.BROADCASTING;
      }

      try {
        // broadcast the transaction

        // if success, set the transaction status to broadcasted
        currentTx.status = DirectTxStatus.BROADCASTED;
      } catch (error) {
        currentTx.status = DirectTxStatus.FAILED;
        currentTx.error = error.message;
      }
    }

    // 3. checking receipt
    if (currentTx.status === DirectTxStatus.BROADCASTED) {
      // check if the transaction is confirmed

      try {
        const confirmed = true;

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

    // TODO: record swap history if needed
  }

  /**
   * Get all recent direct transactions executions
   */
  getRecentDirectTxsBatches(): DirectTxsBatch[] {
    return Array.from(this.recentDirectTxsBatchesMap.values());
  }

  /**
   * Get execution data by ID
   */
  getDirectTxsBatch(id: string): DirectTxsBatch | undefined {
    const batch = this.recentDirectTxsBatchesMap.get(id);
    if (!batch) {
      return undefined;
    }

    return batch;
  }

  /**
   * Get execution result by execution id
   */
  getDirectTxsBatchResult(id: string): DirectTxsBatchResult | undefined {
    const batch = this.recentDirectTxsBatchesMap.get(id);
    if (!batch) {
      return undefined;
    }

    return {
      id: batch.id,
      txs: batch.txs.map((tx) => ({
        chainId: tx.chainId,
        txHash: tx.txHash,
        error: tx.error,
      })),
      swapHistoryId: batch.swapHistoryId,
    };
  }

  /**
   * Cancel execution by execution id
   */
  @action
  async cancelDirectTxs(id: string): Promise<void> {
    const batch = this.recentDirectTxsBatchesMap.get(id);
    if (!batch) {
      return;
    }

    const currentStatus = batch.status;

    // Only pending or processing executions can be cancelled
    if (
      currentStatus !== DirectTxsBatchStatus.PENDING &&
      currentStatus !== DirectTxsBatchStatus.PROCESSING
    ) {
      return;
    }

    // CHECK: cancellation is really needed?
    batch.status = DirectTxsBatchStatus.CANCELLED;

    if (currentStatus === DirectTxsBatchStatus.PROCESSING) {
      // TODO: cancel the current transaction execution...
    }
  }

  @action
  protected removeDirectTxsBatch(id: string): void {
    this.recentDirectTxsBatchesMap.delete(id);
  }
}
