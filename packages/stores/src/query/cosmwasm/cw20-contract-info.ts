import { Cw20ContractTokenInfo } from "./types";
import { KVStore } from "@keplr-wallet/common";
import { ObservableChainQueryMap } from "../chain-query";
import { ChainGetter } from "../../common";
import { computed } from "mobx";
import { ObservableCosmwasmContractChainQuery } from "./contract-query";

export class ObservableQueryCw20ContactInfoInner extends ObservableCosmwasmContractChainQuery<Cw20ContractTokenInfo> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly contractAddress: string
  ) {
    super(kvStore, chainId, chainGetter, contractAddress, { token_info: {} });
  }

  @computed
  get tokenInfo(): Cw20ContractTokenInfo | undefined {
    if (!this.response || !this.response.data) {
      return undefined;
    }

    return this.response.data;
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
