import { ChainGetter } from "../../chain";
import { QuerySharedContext } from "../../common";
import { QueriesSetBase } from "../queries";
import { ObservableQueryEthereumBalanceRegistry } from "./balance";

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
      sharedContext: QuerySharedContext
    ) => {
      return {
        ethereum: new EthereumQueriesImpl(queriesSetBase, sharedContext),
      };
    };
  },
};

export class EthereumQueriesImpl {
  constructor(base: QueriesSetBase, sharedContext: QuerySharedContext) {
    base.queryBalances.addBalanceRegistry(
      new ObservableQueryEthereumBalanceRegistry(sharedContext)
    );
  }
}
