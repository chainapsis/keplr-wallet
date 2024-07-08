import {
  QueriesSetBase,
  ChainGetter,
  QuerySharedContext,
} from "@keplr-wallet/stores";
import { ObservableQueryEthAccountBalanceRegistry } from "./balance";
import { DeepReadonly } from "utility-types";
import { ObservableQueryEthereumBlock } from "./block";
import { ObservableQueryEthereumFeeHistory } from "./fee-histroy";
import { ObservableQueryEVMChainERC20Metadata } from "./erc20-metadata";
import { ObservableQueryERC20ContractInfo } from "./erc20-contract-info";
import { ObservableQueryThirdpartyERC20BalanceRegistry } from "./erc20-balances";
import { ObservableQueryCoingeckoTokenInfo } from "./coingecko-token-info";

export interface EthereumQueries {
  ethereum: EthereumQueriesImpl;
}

export const EthereumQueries = {
  use(options: {
    coingeckoAPIURL: string;
  }): (
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
          chainGetter,
          options.coingeckoAPIURL
        ),
      };
    };
  },
};

export class EthereumQueriesImpl {
  public readonly queryEthereumBlock: DeepReadonly<ObservableQueryEthereumBlock>;
  public readonly queryEthereumFeeHistory: DeepReadonly<ObservableQueryEthereumFeeHistory>;
  public readonly queryEthereumERC20Metadata: DeepReadonly<ObservableQueryEVMChainERC20Metadata>;
  public readonly queryEthereumERC20ContractInfo: DeepReadonly<ObservableQueryERC20ContractInfo>;
  public readonly queryEthereumCoingeckoTokenInfo: DeepReadonly<ObservableQueryCoingeckoTokenInfo>;

  constructor(
    base: QueriesSetBase,
    sharedContext: QuerySharedContext,
    protected chainId: string,
    protected chainGetter: ChainGetter,
    protected coingeckoAPIURL: string
  ) {
    base.queryBalances.addBalanceRegistry(
      new ObservableQueryThirdpartyERC20BalanceRegistry(sharedContext)
    );
    base.queryBalances.addBalanceRegistry(
      new ObservableQueryEthAccountBalanceRegistry(sharedContext)
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

    this.queryEthereumERC20ContractInfo = new ObservableQueryERC20ContractInfo(
      sharedContext,
      chainId,
      chainGetter
    );

    this.queryEthereumCoingeckoTokenInfo =
      new ObservableQueryCoingeckoTokenInfo(
        sharedContext,
        chainId,
        chainGetter,
        coingeckoAPIURL
      );
  }
}
