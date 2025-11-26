import { KVStore } from "@keplr-wallet/common";
import { ChainsService } from "../chains";
import { KeyRingCosmosService } from "../keyring-cosmos";
import { KeyRingEthereumService } from "../keyring-ethereum";
import { AnalyticsService } from "../analytics";
import { RecentSendHistoryService } from "../recent-send-history";
import { BackgroundTxService } from "../tx";
import { BackgroundTxEthereumService } from "../tx-ethereum";
import { Env } from "@keplr-wallet/router";
import {
  DirectTxsExecutionData,
  DirectTxsExecutionResult,
  DirectTx,
} from "./types";

// TODO: implement this service
export class DirectTxExecutorService {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainsService: ChainsService,
    protected readonly keyRingCosmosService: KeyRingCosmosService,
    protected readonly keyRingEthereumService: KeyRingEthereumService,
    protected readonly backgroundTxService: BackgroundTxService,
    protected readonly backgroundTxEthereumService: BackgroundTxEthereumService,
    protected readonly analyticsService: AnalyticsService,
    protected readonly recentSendHistoryService: RecentSendHistoryService
  ) {}

  async init(): Promise<void> {
    // TODO: Load pending executions and resume if needed
  }

  /**
   * Get execution data by ID
   */
  async getDirectTxsExecutionData(
    _id: string
  ): Promise<DirectTxsExecutionData> {
    // TODO: implement
    throw new Error("Not implemented");
  }

  /**
   * Execute single transaction
   * Tx hash is returned if the transaction is executed successfully
   */
  async executeDirectTx(
    _env: Env,
    _id: string,
    _vaultId: string,
    _txIndex: number
  ): Promise<string> {
    // TODO: implement
    throw new Error("Not implemented");
  }

  /**
   * Execute multiple transactions sequentially
   * Execution id is returned if the execution is started successfully
   * and the execution will be started automatically after the transactions are recorded.
   */
  async recordAndExecuteDirectTxs(
    _env: Env,
    _vaultId: string,
    _txs: DirectTx[]
  ): Promise<string> {
    // TODO: implement
    throw new Error("Not implemented");
  }

  /**
   * Get execution result by execution id
   */
  async getDirectTxsExecutionResult(
    _id: string
  ): Promise<DirectTxsExecutionResult> {
    // TODO: implement
    throw new Error("Not implemented");
  }

  /**
   * Cancel execution by execution id
   */
  async cancelDirectTxsExecution(_id: string): Promise<void> {
    // TODO: implement
    throw new Error("Not implemented");
  }
}
