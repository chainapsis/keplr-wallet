import { ObservableCosmwasmContractChainQuery } from "../cosmwasm/contract-query";
import { KVStore } from "@keplr-wallet/common";
import { ChainGetter } from "../../common";
import { computed } from "mobx";
import { ObservableChainQueryMap } from "../chain-query";
import { DomainPrice, DomainPriceResult, DomainPriceType } from "./types";

export class ObservableQueryDomainPriceInner extends ObservableCosmwasmContractChainQuery<DomainPrice> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected override readonly contractAddress: string,
    protected readonly domain: string
  ) {
    super(kvStore, chainId, chainGetter, contractAddress, {
      get_normalized_domain_and_price: { domain: domain },
    });
  }

  @computed
  get isValidDomain(): boolean {
    if (!this.response || !this.response.data.is_valid_domain) {
      return false;
    }
    return this.response.data.is_valid_domain;
  }

  get result(): DomainPriceResult | undefined {
    return this.response?.data?.result;
  }
  get price(): DomainPriceType | undefined {
    return this.response?.data?.result?.Success?.pricing;
  }
}

export class ObservableQueryDomainPrice extends ObservableChainQueryMap<DomainPrice> {
  constructor(
    protected override readonly kvStore: KVStore,
    protected override readonly chainId: string,
    protected override readonly chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (key: string) => {
      const split = key.split("/");
      return new ObservableQueryDomainPriceInner(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        split[0],
        split[1]
      );
    });
  }

  getQueryContract(
    contractAddress: string,
    domain: string
  ): ObservableQueryDomainPriceInner {
    return this.get(
      `${contractAddress}/${domain}`
    ) as ObservableQueryDomainPriceInner;
  }
}
