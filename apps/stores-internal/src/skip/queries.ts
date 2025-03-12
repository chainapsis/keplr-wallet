import { QuerySharedContext } from "@keplr-wallet/stores";
import { DeepReadonly } from "utility-types";
import { ObservableQueryAssetsFromSource } from "./assets-from-source";
import { ObservableQueryRoute } from "./route";
import { ObservableQueryChains } from "./chains";
import { ObservableQueryIbcPfmTransfer } from "./ibc-pfm-transfer";
import { ObservableQueryAssets } from "./assets";
import { ObservableQueryIbcSwap } from "./ibc-swap";
import { ObservableQueryMsgsDirect } from "./msgs-direct";
import { InternalChainStore } from "../internal";
import { SwapUsageQueries } from "../swap-usage";

export class SkipQueries {
  public readonly queryChains: DeepReadonly<ObservableQueryChains>;
  public readonly queryAssets: DeepReadonly<ObservableQueryAssets>;
  public readonly queryAssetsFromSource: DeepReadonly<ObservableQueryAssetsFromSource>;
  public readonly queryRoute: DeepReadonly<ObservableQueryRoute>;

  public readonly queryMsgsDirect: DeepReadonly<ObservableQueryMsgsDirect>;

  public readonly queryIBCPacketForwardingTransfer: DeepReadonly<ObservableQueryIbcPfmTransfer>;
  public readonly queryIBCSwap: DeepReadonly<ObservableQueryIbcSwap>;

  constructor(
    sharedContext: QuerySharedContext,
    chainStore: InternalChainStore,
    swapUsageQueries: SwapUsageQueries,
    swapVenues: {
      name: string;
      chainId: string;
    }[]
  ) {
    this.queryChains = new ObservableQueryChains(
      sharedContext,
      chainStore,
      "https://api.skip.money"
    );
    this.queryAssets = new ObservableQueryAssets(
      sharedContext,
      chainStore,
      swapUsageQueries,
      "https://api.skip.money"
    );
    this.queryAssetsFromSource = new ObservableQueryAssetsFromSource(
      sharedContext,
      chainStore,
      "https://api.skip.money"
    );
    this.queryRoute = new ObservableQueryRoute(
      sharedContext,
      chainStore,
      "https://api.skip.money"
    );

    this.queryMsgsDirect = new ObservableQueryMsgsDirect(
      sharedContext,
      chainStore,
      "https://api.skip.money"
    );

    this.queryIBCPacketForwardingTransfer = new ObservableQueryIbcPfmTransfer(
      chainStore,
      this.queryChains,
      this.queryAssets,
      this.queryAssetsFromSource
    );
    this.queryIBCSwap = new ObservableQueryIbcSwap(
      chainStore,
      this.queryAssets,
      this.queryAssetsFromSource,
      this.queryChains,
      this.queryRoute,
      this.queryMsgsDirect,
      this.queryIBCPacketForwardingTransfer,
      swapVenues
    );
  }
}
