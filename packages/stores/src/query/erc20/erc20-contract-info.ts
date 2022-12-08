import { ObservableQueryERC20ContractData } from "./contract-query";

import { ERC20ContractTokenInfo } from "./types";
import { ChainGetter, HasMapStore, QueryError } from "../../common";

import { KVStore } from "@keplr-wallet/common";
import { computed } from "mobx";

export class ObservableQueryERC20ContractInfoInner extends ObservableQueryERC20ContractData {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly contractAddress: string
  ) {
    super(kvStore, chainId, chainGetter, contractAddress, "");
  }

  @computed
  get tokenInfo(): ERC20ContractTokenInfo | undefined {
    if (!this.queryContractData) {
      return undefined;
    }

    return {
      decimals: this.queryContractData.decimals,
      symbol: this.queryContractData.symbol,
      name: this.queryContractData.name,
    };
  }

  get isFetching(): boolean {
    return this.queryContractData.isFetching;
  }

  get error(): QueryError<unknown> | undefined {
    return this.queryContractData.error;
  }
}

export class ObservableQueryERC20ContractInfo extends HasMapStore<ObservableQueryERC20ContractInfoInner> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super((contractAddress: string) => {
      return new ObservableQueryERC20ContractInfoInner(
        kvStore,
        chainId,
        chainGetter,
        contractAddress
      );
    });
  }

  getQueryContract(
    contractAddress: string
  ): ObservableQueryERC20ContractInfoInner {
    return this.get(contractAddress) as ObservableQueryERC20ContractInfoInner;
  }
}
