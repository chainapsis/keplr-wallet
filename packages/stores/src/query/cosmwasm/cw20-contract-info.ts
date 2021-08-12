import { Cw20ContractTokenInfo } from "./types";
import { KVStore } from "@keplr-wallet/common";
import { ObservableChainQuery, ObservableChainQueryMap } from "../chain-query";
import { ChainGetter } from "../../common";
import { computed, makeObservable } from "mobx";

export class ObservableQueryCw20ContactInfoInner extends ObservableChainQuery<Cw20ContractTokenInfo> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly contractAddress: string
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      `/wasm/v1beta1/contract/${contractAddress}/smart/eyJ0b2tlbl9pbmZvIjp7fX0=`
    );
    makeObservable(this);
  }
  
  @computed
  get tokenInfo(): Cw20ContractTokenInfo["data"] | undefined {
    if (!this.response || !this.response.data.data) {
      return undefined;
    }

    return this.response.data.data;
  }
}

export class ObservableQueryCw20ContractInfo extends ObservableChainQueryMap<Cw20ContractTokenInfo> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (contractAddress: string) => {
      return new ObservableQueryCw20ContactInfoInner(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        contractAddress
      );
    });
  }

  getQueryContract(
    contractAddress: string
  ): ObservableQueryCw20ContactInfoInner {
    return this.get(contractAddress) as ObservableQueryCw20ContactInfoInner;
  }
}
