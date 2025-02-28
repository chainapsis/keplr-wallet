import { QueriesSetBase } from "../queries";
import { ChainGetter } from "../../chain";
import { DeepReadonly } from "utility-types";
import { QuerySharedContext } from "../../common";
import {
  ObservableQueryNobleSwapPools,
  ObservableQueryNobleSwapRates,
  ObservableQueryNobleSwapSimulateSwap,
} from "./swap";
import { ObservableQueryNobleYield } from "./yield";

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
  public readonly querySwapSimulateSwap: DeepReadonly<ObservableQueryNobleSwapSimulateSwap>;
  public readonly queryYield: DeepReadonly<ObservableQueryNobleYield>;

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
    this.querySwapSimulateSwap = new ObservableQueryNobleSwapSimulateSwap(
      sharedContext,
      chainId,
      chainGetter
    );
    this.queryYield = new ObservableQueryNobleYield(
      sharedContext,
      chainId,
      chainGetter
    );
  }
}
