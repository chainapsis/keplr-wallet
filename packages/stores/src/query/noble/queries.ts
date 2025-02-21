import { QueriesSetBase } from "../queries";
import { ChainGetter } from "../../chain";
import { DeepReadonly } from "utility-types";
import { QuerySharedContext } from "../../common";
import { ObservableQueryNobleSwapRates } from "./swap";

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
  }
}
