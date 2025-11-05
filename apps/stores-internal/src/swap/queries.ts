import { QuerySharedContext } from "@keplr-wallet/stores";
import { DeepReadonly } from "utility-types";
import { ObservableQuerySwappable } from "./swappable";
import { InternalChainStore } from "../internal";
import { ObservableQueryTargetAssets } from "./target-assets";

export class SwapQueries {
  public readonly querySwappable: DeepReadonly<ObservableQuerySwappable>;
  public readonly queryTargetAssets: DeepReadonly<ObservableQueryTargetAssets>;

  constructor(
    sharedContext: QuerySharedContext,
    chainStore: InternalChainStore,
    baseURL: string
  ) {
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
  }
}
