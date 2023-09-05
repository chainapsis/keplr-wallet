import { QueriesSetBase } from "../queries";
import { ChainGetter } from "../../chain";
import { DeepReadonly } from "utility-types";
import { QuerySharedContext } from "../../common";
import { ObservableQueryVbankAssets } from "./vbank-assets";

export interface AgoricQueries {
  agoric: AgoricQueriesImpl;
}

export const AgoricQueries = {
  use(): (
    queriesSetBase: QueriesSetBase,
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) => AgoricQueries {
    return (
      queriesSetBase: QueriesSetBase,
      sharedContext: QuerySharedContext,
      chainId: string,
      chainGetter: ChainGetter
    ) => {
      return {
        agoric: new AgoricQueriesImpl(
          queriesSetBase,
          sharedContext,
          chainId,
          chainGetter
        ),
      };
    };
  },
};

export class AgoricQueriesImpl {
  public readonly queryVbankAssets: DeepReadonly<ObservableQueryVbankAssets>;

  constructor(
    _: QueriesSetBase,
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    this.queryVbankAssets = new ObservableQueryVbankAssets(
      sharedContext,
      chainId,
      chainGetter
    );
  }
}
