import { ObservableQueryERC20Metadata } from "./metadata-query";

import { ERC20ContractTokenInfo } from "./types";
import { ChainGetter, HasMapStore, QueryError } from "../../common";

import { KVStore } from "@keplr-wallet/common";
import { computed } from "mobx";

export class ObservableQueryERC20ContractInfoInner extends ObservableQueryERC20Metadata {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly contractAddress: string
  ) {
    super(kvStore, chainId, chainGetter, contractAddress);
  }

  @computed
  get tokenInfo(): ERC20ContractTokenInfo | undefined {
    if (!this.queryContractMetadata) {
      return undefined;
    }

    return this.queryContractMetadata.tokenInfo;
  }

  @computed
  get isFetching(): boolean {
    return this.queryContractMetadata.isFetching;
  }

  @computed
  get error(): QueryError<unknown> | undefined {
    return this.queryContractMetadata.error;
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
