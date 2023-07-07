import { QueriesSetBase, QuerySharedContext } from "@keplr-wallet/stores";
import { DeepReadonly } from "utility-types";
import { ObservableQueryTokenContracts } from "./names";

export interface TokenContractsQueries {
  tokenContracts: TokenContractsQueriesImpl;
}

export const TokenContractsQueries = {
  use(): (
    queriesSetBase: QueriesSetBase,
    sharedContext: QuerySharedContext
  ) => TokenContractsQueries {
    return (
      queriesSetBase: QueriesSetBase,
      sharedContext: QuerySharedContext
    ) => {
      return {
        tokenContracts: new TokenContractsQueriesImpl(
          queriesSetBase,
          sharedContext
        ),
      };
    };
  },
};

export class TokenContractsQueriesImpl {
  public readonly queryTokenContracts: DeepReadonly<ObservableQueryTokenContracts>;

  constructor(_base: QueriesSetBase, sharedContext: QuerySharedContext) {
    this.queryTokenContracts = new ObservableQueryTokenContracts(sharedContext);
  }
}
