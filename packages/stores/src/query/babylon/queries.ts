import { QueriesSetBase } from "../queries";
import { ChainGetter } from "../../chain";
import { DeepReadonly } from "utility-types";
import { QuerySharedContext } from "../../common";
import { ObservableQueryBabylonLastEpochMsgs } from "./epoching";

export interface BabylonQueries {
  babylon: BabylonQueriesImpl;
}

export const BabylonQueries = {
  use(): (
    queriesSetBase: QueriesSetBase,
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) => BabylonQueries {
    return (
      queriesSetBase: QueriesSetBase,
      sharedContext: QuerySharedContext,
      chainId: string,
      chainGetter: ChainGetter
    ) => {
      return {
        babylon: new BabylonQueriesImpl(
          queriesSetBase,
          sharedContext,
          chainId,
          chainGetter
        ),
      };
    };
  },
};

export class BabylonQueriesImpl {
  public readonly queryLastEpochMsgs: DeepReadonly<ObservableQueryBabylonLastEpochMsgs>;

  constructor(
    _: QueriesSetBase,
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    this.queryLastEpochMsgs = new ObservableQueryBabylonLastEpochMsgs(
      sharedContext,
      chainId,
      chainGetter
    );
  }
}
