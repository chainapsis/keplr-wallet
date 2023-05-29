import { QueriesSetBase } from "../queries";
import { ChainGetter } from "../../chain";
import { DeepReadonly } from "utility-types";
import { ObservableQueryICNSNames } from "./names";
import { QuerySharedContext } from "../../common";

export interface ICNSQueries {
  icns: ICNSQueriesImpl;
}

export const ICNSQueries = {
  use(): (
    queriesSetBase: QueriesSetBase,
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) => ICNSQueries {
    return (
      queriesSetBase: QueriesSetBase,
      sharedContext: QuerySharedContext,
      chainId: string,
      chainGetter: ChainGetter
    ) => {
      return {
        icns: new ICNSQueriesImpl(
          queriesSetBase,
          sharedContext,
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
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    this.queryICNSNames = new ObservableQueryICNSNames(
      sharedContext,
      chainId,
      chainGetter
    );
  }
}
