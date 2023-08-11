import { DeepReadonly } from "utility-types";
import { ChainGetter } from "../../chain";
import { QuerySharedContext } from "../../common";
import { QueriesSetBase } from "../queries";
import { ObservableQueryEthereumBalanceRegistry } from "./balance";
import { ObservableQueryEthereumNonce } from "./nonce";

export interface EthereumQueries {
  ethereum: EthereumQueriesImpl;
}

export const EthereumQueries = {
  use(): (
    queriesSetBase: QueriesSetBase,
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) => EthereumQueries {
    return (
      queriesSetBase: QueriesSetBase,
      sharedContext: QuerySharedContext,
      chainId: string,
      chainGetter: ChainGetter
    ) => {
      return {
        ethereum: new EthereumQueriesImpl(
          queriesSetBase,
          sharedContext,
          chainId,
          chainGetter
        ),
      };
    };
  },
};

export class EthereumQueriesImpl {
  public readonly queryEthereumNonce: DeepReadonly<ObservableQueryEthereumNonce>;

  constructor(
    base: QueriesSetBase,
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    base.queryBalances.addBalanceRegistry(
      new ObservableQueryEthereumBalanceRegistry(sharedContext)
    );

    this.queryEthereumNonce = new ObservableQueryEthereumNonce(
      sharedContext,
      chainId,
      chainGetter
    );
  }
}
