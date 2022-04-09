import { QueriesSetBase, ChainGetter } from "@keplr-wallet/stores";
import { KVStore } from "@keplr-wallet/common";
import { DeepReadonly } from "utility-types";
import { ObservableQueryERC20Metadata } from "./erc20/query";

export interface KeplrETCQueries {
  keplrETC: KeplrETCQueriesImpl;
}

export const KeplrETCQueries = {
  use(options: {
    ethereumURL: string;
  }): (
    queriesSetBase: QueriesSetBase,
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter
  ) => KeplrETCQueries {
    return (
      queriesSetBase: QueriesSetBase,
      kvStore: KVStore,
      chainId: string,
      chainGetter: ChainGetter
    ) => {
      return {
        keplrETC: new KeplrETCQueriesImpl(
          queriesSetBase,
          kvStore,
          chainId,
          chainGetter,
          options.ethereumURL
        ),
      };
    };
  },
};

export class KeplrETCQueriesImpl {
  public readonly queryERC20Metadata: DeepReadonly<ObservableQueryERC20Metadata>;

  constructor(
    _base: QueriesSetBase,
    kvStore: KVStore,
    _chainId: string,
    _chainGetter: ChainGetter,
    ethereumURL: string
  ) {
    this.queryERC20Metadata = new ObservableQueryERC20Metadata(
      kvStore,
      ethereumURL
    );
  }
}
