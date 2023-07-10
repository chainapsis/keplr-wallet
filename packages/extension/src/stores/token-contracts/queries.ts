import { QueriesSetBase, QuerySharedContext } from "@keplr-wallet/stores";
import { DeepReadonly } from "utility-types";
import { ObservableQueryTokenContracts } from "./contracts";

export interface TokenContractsQueries {
  tokenContracts: TokenContractsQueriesImpl;
}

export const TokenContractsQueries = {
  use(): (
    queriesSetBase: QueriesSetBase,
    sharedContext: QuerySharedContext,
    chainId: string
  ) => TokenContractsQueries {
    return (
      queriesSetBase: QueriesSetBase,
      sharedContext: QuerySharedContext,
      chainId: string
    ) => {
      return {
        tokenContracts: new TokenContractsQueriesImpl(
          queriesSetBase,
          sharedContext,
          chainId
        ),
      };
    };
  },
};

export class TokenContractsQueriesImpl {
  public readonly queryTokenContracts: DeepReadonly<ObservableQueryTokenContracts>;

  constructor(
    _base: QueriesSetBase,
    sharedContext: QuerySharedContext,
    chainId: string
  ) {
    this.queryTokenContracts = new ObservableQueryTokenContracts(
      sharedContext,
      chainId
    );
  }
}
