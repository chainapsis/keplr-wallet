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
  DirectTxType,
  EVMDirectTx,
  CosmosDirectTx,
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
  async recordAndExecuteDirectTxs(
    env: Env,
    vaultId: string,
    type: DirectTxBatchType,
    txs: DirectTx[],
    executableChainIds: string[]
  ): Promise<DirectTxBatchStatus> {
    if (!env.isInternalMsg) {
      throw new KeplrError("direct-tx-executor", 101, "Not internal message");
    }

    // CHECK: 다중 체인 트랜잭션이 아니라면 굳이 이걸 기록할 필요가 있을까?
    // 다중 체인 트랜잭션을 기록하는 이유는 자산 브릿징 등 상당한 시간이 걸리는 경우 이 작업을 백그라운드에서 한없이 기다리는 대신
    // 실행 조건이 만족되었을 때 이어서 실행하기 위함인데, 한 번에 처리가 가능하다면 굳이 이걸 기록할 필요는 없을지도 모른다.
    // 특히나 ui에서 진행상황을 체크하는 것이 아닌 이상 notification을 통해 진행상황을 알리는 것으로 충분할 수 있다.
    const id = (this.recentDirectTxBatchSeq++).toString();

    const batchBase: DirectTxBatchBase = {
      id,
      status: DirectTxBatchStatus.PENDING,
      vaultId: vaultId,
      txs: txs,
      txIndex: -1,
      executableChainIds: executableChainIds,
      timestamp: Date.now(),
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
    return await this.executeDirectTxs(id);
  }

  /**
   * Execute blocked transactions by execution id and transaction index
   */
  @action
  async resumeDirectTxs(
    env: Env,
    id: string,
    txIndex?: number,
    signedTx?: Uint8Array,
    signature?: Uint8Array
  ): Promise<DirectTxBatchStatus> {
    if (!env.isInternalMsg) {
      // TODO: 에러 코드 신경쓰기
      throw new KeplrError("direct-tx-executor", 101, "Not internal message");
    }

    return await this.executeDirectTxs(id, {
      env,
      txIndex,
      signedTx,
      signature,
    });
  }

  protected async executeDirectTxs(
    id: string,
    options?: {
      env?: Env;
      txIndex?: number;
      signedTx?: Uint8Array;
      signature?: Uint8Array;
    }
  ): Promise<DirectTxBatchStatus> {
    const batch = this.getDirectTxBatch(id);
    if (!batch) {
      throw new KeplrError("direct-tx-executor", 105, "Execution not found");
    }

    // Only pending/processing/blocked executions can be executed
    const needResume =
      batch.status === DirectTxBatchStatus.PENDING ||
      batch.status === DirectTxBatchStatus.PROCESSING ||
      batch.status === DirectTxBatchStatus.BLOCKED;
    if (!needResume) {
      return batch.status;
    }

    // check if the key is valid
    const keyInfo = this.keyRingCosmosService.keyRingService.getKeyInfo(
      batch.vaultId
    );
    if (!keyInfo) {
      throw new KeplrError("direct-tx-executor", 102, "Key info not found");
    }

    const executionStartIndex = Math.min(
      options?.txIndex ?? batch.txIndex < 0 ? 0 : batch.txIndex,
      batch.txs.length - 1
    );

    batch.status = DirectTxBatchStatus.PROCESSING;

    for (let i = executionStartIndex; i < batch.txs.length; i++) {
      let txStatus: DirectTxStatus;

      if (options?.txIndex != null && i === options.txIndex) {
        txStatus = await this.executePendingDirectTx(id, i, {
          env: options?.env,
          signedTx: options.signedTx,
          signature: options.signature,
        });
      } else {
        txStatus = await this.executePendingDirectTx(id, i, {
          env: options?.env,
        });
      }

      if (txStatus === DirectTxStatus.CONFIRMED) {
        continue;
      }

      // if the tx is blocked, it means multiple transactions are required to be executed on different chains
      // the execution should be stopped and record the history if needed
      // and the execution should be resumed later when the condition is met
      if (txStatus === DirectTxStatus.BLOCKED) {
        batch.status = DirectTxBatchStatus.BLOCKED;
        this.recordHistoryIfNeeded(batch);
        return batch.status;
      }

      // if the tx is failed, the execution should be stopped
      if (txStatus === DirectTxStatus.FAILED) {
        batch.status = DirectTxBatchStatus.FAILED;
        return batch.status;
      }

      // something went wrong, should not happen
      throw new KeplrError(
        "direct-tx-executor",
        107,
        "Unexpected tx status: " + txStatus
      );
    }

    // if the execution is completed successfully, update the batch status
    batch.status = DirectTxBatchStatus.COMPLETED;
    this.recordHistoryIfNeeded(batch);
    return batch.status;
  }

  protected async executePendingDirectTx(
    id: string,
    index: number,
    options?: {
      env?: Env;
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
      if (
        this.checkIfTxIsBlocked(batch.executableChainIds, currentTx.chainId)
      ) {
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
          const { signedTx, signature } = await this.signTx(
            batch.vaultId,
            currentTx.chainId,
            currentTx,
            options?.env
          );

          currentTx.signedTx = signedTx;
          currentTx.signature = signature;
          currentTx.status = DirectTxStatus.SIGNED;
        } catch (error) {
          currentTx.status = DirectTxStatus.FAILED;
          currentTx.error = error.message ?? "Transaction signing failed";
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
        currentTx.error = error.message ?? "Transaction broadcasting failed";
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
        currentTx.error = error.message ?? "Transaction confirmation failed";
      }
    }

    return currentTx.status;
  }

  protected checkIfTxIsBlocked(
    executableChainIds: string[],
    chainId: string
  ): boolean {
    return !executableChainIds.includes(chainId);
  }

  protected checkIfTxIsSigned(tx: DirectTx): boolean {
    return tx.signedTx != null && tx.signature != null;
  }

  protected checkIfTxIsBroadcasted(tx: DirectTx): boolean {
    const isBroadcasted = tx.txHash != null;
    if (!isBroadcasted) {
      return false;
    }

    // optimistic assumption here:
    // if the tx hash is set, the transaction is broadcasted successfully
    // do not need to check broadcasted status here
    return true;
  }

  protected async signTx(
    vaultId: string,
    chainId: string,
    tx: DirectTx,
    env?: Env
  ): Promise<{
    signedTx: Uint8Array;
    signature: Uint8Array;
  }> {
    if (tx.type === DirectTxType.EVM) {
      return this.signEvmTx(vaultId, chainId, tx, env);
    }

    return this.signCosmosTx(vaultId, chainId, tx, env);
  }

  protected async signEvmTx(
    vaultId: string,
    chainId: string,
    tx: EVMDirectTx,
    env?: Env
  ): Promise<{
    signedTx: Uint8Array;
    signature: Uint8Array;
  }> {
    // check key
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
      signature: result.signature,
    };
  }

  protected async signCosmosTx(
    _vaultId: string,
    _chainId: string,
    _tx: CosmosDirectTx,
    _env?: Env
  ): Promise<{
    signedTx: Uint8Array;
    signature: Uint8Array;
  }> {
    // check key

    // check chain

    // if ledger
    // - check if env is provided
    // - sign page로 이동해서 서명 요청

    // else
    // - sign directly with stored key

    return {
      signedTx: new Uint8Array(),
      signature: new Uint8Array(),
    };
  }

  protected async broadcastTx(tx: DirectTx): Promise<{
    txHash: string;
  }> {
    if (tx.type === DirectTxType.EVM) {
      return this.broadcastEvmTx(tx);
    }

    return this.broadcastCosmosTx(tx);
  }

  protected async broadcastEvmTx(tx: EVMDirectTx): Promise<{
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

  protected async broadcastCosmosTx(tx: CosmosDirectTx): Promise<{
    txHash: string;
  }> {
    // check signed tx and signature
    // do not validate the signed tx and signature here just assume it is valid

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

  protected async checkIfTxIsConfirmed(tx: DirectTx): Promise<boolean> {
    if (tx.type === DirectTxType.EVM) {
      return this.checkIfEvmTxIsConfirmed(tx);
    }

    return this.checkIfCosmosTxIsConfirmed(tx);
  }

  protected async checkIfEvmTxIsConfirmed(tx: EVMDirectTx): Promise<boolean> {
    if (!tx.txHash) {
      return false;
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

  protected async checkIfCosmosTxIsConfirmed(
    tx: CosmosDirectTx
  ): Promise<boolean> {
    if (!tx.txHash) {
      return false;
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
