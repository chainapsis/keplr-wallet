import { QuerySharedContext } from "@keplr-wallet/stores";
import { DeepReadonly } from "utility-types";
import { ObservableQuerySwappable } from "./swappable";
import { InternalChainStore } from "../internal";
import { ObservableQueryTargetAssets } from "./target-assets";
import { ObservableQueryRelatedAssets } from "./related-assets";
import { ObservableQueryValidateTargetAssets } from "./validate-target-assets";
import { ObservableQueryRouteV2 } from "./route";
import { ObservableQueryChainsV2 } from "./chains";
import { ObservableQueryTransferPaths } from "./transfer-paths";

export class SwapQueries {
  public readonly queryChains: DeepReadonly<ObservableQueryChainsV2>;

  public readonly querySwappable: DeepReadonly<ObservableQuerySwappable>;
  public readonly queryTargetAssets: DeepReadonly<ObservableQueryTargetAssets>;
  public readonly queryRelatedAssets: DeepReadonly<ObservableQueryRelatedAssets>;
  public readonly queryValidateTargetAssets: DeepReadonly<ObservableQueryValidateTargetAssets>;
  public readonly queryRoute: DeepReadonly<ObservableQueryRouteV2>;

  public readonly queryTransferPaths: DeepReadonly<ObservableQueryTransferPaths>;

  constructor(
    sharedContext: QuerySharedContext,
    chainStore: InternalChainStore,
    baseURL: string
  ) {
    this.queryChains = new ObservableQueryChainsV2(
      sharedContext,
      chainStore,
      baseURL
    );
    this.querySwappable = new ObservableQuerySwappable(
      sharedContext,
      chainStore,
      baseURL
    );
    this.queryTargetAssets = new ObservableQueryTargetAssets(
      sharedContext,
      chainStore,
      baseURL
    );
    this.queryRelatedAssets = new ObservableQueryRelatedAssets(
      sharedContext,
      chainStore,
      baseURL
    );
    this.queryValidateTargetAssets = new ObservableQueryValidateTargetAssets(
      sharedContext,
      chainStore,
      baseURL
    );
    this.queryRoute = new ObservableQueryRouteV2(
      sharedContext,
      chainStore,
      baseURL
    );

    this.queryTransferPaths = new ObservableQueryTransferPaths(
      chainStore,
      this.queryChains,
      this.queryTargetAssets,
      this.queryRelatedAssets
    );
  }
}
