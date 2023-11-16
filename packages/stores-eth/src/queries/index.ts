import {
  QueriesSetBase,
  ChainGetter,
  QuerySharedContext,
} from "@keplr-wallet/stores";
import { ObservableQueryEthAccountBalanceRegistry } from "./balance";
import { ObservableQueryEthereumERC20BalanceRegistry } from "./erc20-balance";
import { DeepReadonly } from "utility-types";
import { ObservableQueryEthereumBlock } from "./block";
import { ObservableQueryEthereumFeeHistory } from "./fee-histroy";
import { ObservableQueryEVMChainERC20Metadata } from "./erc20-metadata";

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
  public readonly queryEthereumBlock: DeepReadonly<ObservableQueryEthereumBlock>;
  public readonly queryEthereumFeeHistory: DeepReadonly<ObservableQueryEthereumFeeHistory>;
  public readonly queryEthereumERC20Metadata: DeepReadonly<ObservableQueryEVMChainERC20Metadata>;

  constructor(
    base: QueriesSetBase,
    sharedContext: QuerySharedContext,
    protected chainId: string,
    protected chainGetter: ChainGetter
  ) {
    base.queryBalances.addBalanceRegistry(
      new ObservableQueryEthAccountBalanceRegistry(sharedContext)
    );
    base.queryBalances.addBalanceRegistry(
      new ObservableQueryEthereumERC20BalanceRegistry(sharedContext)
    );

    this.queryEthereumBlock = new ObservableQueryEthereumBlock(
      sharedContext,
      chainId,
      chainGetter
    );

    this.queryEthereumFeeHistory = new ObservableQueryEthereumFeeHistory(
      sharedContext,
      chainId,
      chainGetter
    );

    this.queryEthereumERC20Metadata = new ObservableQueryEVMChainERC20Metadata(
      sharedContext,
      chainId,
      chainGetter
    );
  }
}
