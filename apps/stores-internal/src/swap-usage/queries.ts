import { QuerySharedContext } from "@keplr-wallet/stores";
import { DeepReadonly } from "utility-types";
import { ObservableQuerySwapUsage } from "./swap-usage";

export class SwapUsageQueries {
  public readonly querySwapUsage: DeepReadonly<ObservableQuerySwapUsage>;

  constructor(sharedContext: QuerySharedContext, baseURL: string) {
    this.querySwapUsage = new ObservableQuerySwapUsage(sharedContext, baseURL);
  }
}
