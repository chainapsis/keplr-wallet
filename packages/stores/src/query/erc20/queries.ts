import { QueriesSetBase } from "../queries";
import { ChainGetter } from "../../common";
import { KVStore } from "@keplr-wallet/common";
import { ObservableQueryERC20ContractInfo } from "./erc20-contract-info";
import { DeepReadonly } from "utility-types";
import { ObservableQueryERC20BalanceRegistry } from "./erc20-balance";
import { ERC20TxClient } from "./transaction-client";

export interface ERC20Queries {
  erc20: ERC20QueriesImpl;
}

export const ERC20Queries = {
  use(): (
    queriesSetBase: QueriesSetBase,
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter
  ) => ERC20Queries {
    return (
      queriesSetBase: QueriesSetBase,
      kvStore: KVStore,
      chainId: string,
      chainGetter: ChainGetter
    ) => {
      return {
        erc20: new ERC20QueriesImpl(
          queriesSetBase,
          kvStore,
          chainId,
          chainGetter
        ),
      };
    };
  },
};

export class ERC20QueriesImpl {
  public readonly queryERC20ContractInfo: DeepReadonly<ObservableQueryERC20ContractInfo>;
  public readonly txClient: DeepReadonly<ERC20TxClient>;

  constructor(
    base: QueriesSetBase,
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    base.queryBalances.addBalanceRegistry(
      new ObservableQueryERC20BalanceRegistry(kvStore)
    );

    this.queryERC20ContractInfo = new ObservableQueryERC20ContractInfo(
      kvStore,
      chainId,
      chainGetter
    );

    this.txClient = new ERC20TxClient(kvStore, chainId, chainGetter);
  }
}
