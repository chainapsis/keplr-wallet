import { QueriesSetBase, QuerySharedContext } from "@keplr-wallet/stores";
import { DeepReadonly } from "utility-types";
import { ObservableQueryTokenContracts } from "./contracts";

export interface TokenContractsQueries {
  tokenContracts: TokenContractsQueriesImpl;
}

export const TokenContractsQueries = {
  use(options: {
    tokenContractListURL: string;
  }): (
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
          chainId,
          options.tokenContractListURL
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
    chainId: string,
    tokenContractListURL: string
  ) {
    this.queryTokenContracts = new ObservableQueryTokenContracts(
      sharedContext,
      chainId,
      tokenContractListURL
    );
  }
}
