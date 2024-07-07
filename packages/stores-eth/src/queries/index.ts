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
import { ObservableQueryERC20ContractInfo } from "./erc20-contract-info";
import { ObservableQueryEthereumMaxPriorityFee } from "./max-priority-fee";

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
  public readonly queryEthereumERC20ContractInfo: DeepReadonly<ObservableQueryERC20ContractInfo>;
  public readonly queryEthereumMaxPriorityFee: DeepReadonly<ObservableQueryEthereumMaxPriorityFee>;

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

    this.queryEthereumERC20ContractInfo = new ObservableQueryERC20ContractInfo(
      sharedContext,
      chainId,
      chainGetter
    );

    this.queryEthereumMaxPriorityFee =
      new ObservableQueryEthereumMaxPriorityFee(
        sharedContext,
        chainId,
        chainGetter
      );
  }
}
