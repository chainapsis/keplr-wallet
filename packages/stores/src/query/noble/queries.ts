import { QueriesSetBase } from "../queries";
import { ChainGetter } from "../../chain";
import { DeepReadonly } from "utility-types";
import { QuerySharedContext } from "../../common";
import {
  ObservableQueryNobleSwapPools,
  ObservableQueryNobleSwapRates,
} from "./swap";

export interface NobleQueries {
  noble: NobleQueriesImpl;
}

export const NobleQueries = {
  use(): (
    queriesSetBase: QueriesSetBase,
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) => NobleQueries {
    return (
      queriesSetBase: QueriesSetBase,
      sharedContext: QuerySharedContext,
      chainId: string,
      chainGetter: ChainGetter
    ) => {
      return {
        noble: new NobleQueriesImpl(
          queriesSetBase,
          sharedContext,
          chainId,
          chainGetter
        ),
      };
    };
  },
};

export class NobleQueriesImpl {
  public readonly querySwapRates: DeepReadonly<ObservableQueryNobleSwapRates>;
  public readonly querySwapPools: DeepReadonly<ObservableQueryNobleSwapPools>;

  constructor(
    _: QueriesSetBase,
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    this.querySwapRates = new ObservableQueryNobleSwapRates(
      sharedContext,
      chainId,
      chainGetter
    );
    this.querySwapPools = new ObservableQueryNobleSwapPools(
      sharedContext,
      chainId,
      chainGetter
    );
  }
}
