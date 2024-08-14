import { QuerySharedContext } from "@keplr-wallet/stores";
import { DeepReadonly } from "utility-types";
import { ObservableQueryStarknetERC20Balance } from "./erc20-balance";

export class StarknetQueriesStore {
  protected map: Map<string, StarknetQueriesStoreImpl> = new Map();

  constructor(protected readonly sharedContext: QuerySharedContext) {}

  public get(chainId: string): DeepReadonly<StarknetQueriesStoreImpl> {
    const prior = this.map.get(chainId);
    if (prior) {
      return prior;
    }

    const store = new StarknetQueriesStoreImpl(this.sharedContext);
    this.map.set(chainId, store);
    return store;
  }
}

class StarknetQueriesStoreImpl {
  public readonly queryStarknetERC20Balance: DeepReadonly<ObservableQueryStarknetERC20Balance>;

  constructor(protected readonly sharedContext: QuerySharedContext) {
    this.queryStarknetERC20Balance = new ObservableQueryStarknetERC20Balance(
      sharedContext
    );
  }
}
