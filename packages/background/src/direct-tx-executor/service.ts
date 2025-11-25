import { KVStore } from "@keplr-wallet/common";
import { ChainsService } from "../chains";
import { KeyRingCosmosService } from "../keyring-cosmos";
import { KeyRingEthereumService } from "../keyring-ethereum";
import { AnalyticsService } from "../analytics";
import { RecentSendHistoryService } from "../recent-send-history";
import { BackgroundTxService } from "../tx";
import { BackgroundTxEthereumService } from "../tx-ethereum";

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
    // noop
  }
}
