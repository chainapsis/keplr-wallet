import { ChainGetter, QuerySharedContext } from "@keplr-wallet/stores";
import { DeepReadonly } from "utility-types";
import { ObservableQueryAssetsFromSource } from "./assets-from-source";
import { ObservableQueryRoute } from "./route";
import { ObservableQueryChains } from "./chains";
import { ObservableQueryIbcPfmTransfer } from "./ibc-pfm-transfer";

export class SkipQueries {
  public readonly queryChains: DeepReadonly<ObservableQueryChains>;
  public readonly queryAssetsFromSource: DeepReadonly<ObservableQueryAssetsFromSource>;
  public readonly queryRoute: DeepReadonly<ObservableQueryRoute>;

  public readonly queryIBCPacketForwardingTransfer: DeepReadonly<ObservableQueryIbcPfmTransfer>;

  constructor(sharedContext: QuerySharedContext, chainGetter: ChainGetter) {
    this.queryChains = new ObservableQueryChains(
      sharedContext,
      chainGetter,
      "https://api.skip.money"
    );
    this.queryAssetsFromSource = new ObservableQueryAssetsFromSource(
      sharedContext,
      chainGetter,
      "https://api.skip.money"
    );
    this.queryRoute = new ObservableQueryRoute(
      sharedContext,
      chainGetter,
      "https://api.skip.money"
    );

    this.queryIBCPacketForwardingTransfer = new ObservableQueryIbcPfmTransfer(
      chainGetter,
      this.queryChains,
      this.queryAssetsFromSource
    );
  }
}
