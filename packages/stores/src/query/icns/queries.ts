import { QueriesSetBase } from "../queries";
import { ChainGetter } from "../../common";
import { KVStore } from "@keplr-wallet/common";
import { DeepReadonly } from "utility-types";
import { ObservableQueryICNSNames } from "./names";

export interface ICNSQueries {
  icns: ICNSQueriesImpl;
}

export const ICNSQueries = {
  use(): (
    queriesSetBase: QueriesSetBase,
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter
  ) => ICNSQueries {
    return (
      queriesSetBase: QueriesSetBase,
      kvStore: KVStore,
      chainId: string,
      chainGetter: ChainGetter
    ) => {
      return {
        icns: new ICNSQueriesImpl(
          queriesSetBase,
          kvStore,
          chainId,
          chainGetter
        ),
      };
    };
  },
};

export class ICNSQueriesImpl {
  public readonly queryICNSNames: DeepReadonly<ObservableQueryICNSNames>;

  constructor(
    _base: QueriesSetBase,
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    this.queryICNSNames = new ObservableQueryICNSNames(
      kvStore,
      chainId,
      chainGetter
    );
  }
}
