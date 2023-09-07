import { ObservableCosmwasmContractChainQuery } from "../cosmwasm/contract-query";
import { KVStore } from "@keplr-wallet/common";
import { ChainGetter } from "../../common";
import { computed } from "mobx";
import { ObservableChainQueryMap } from "../chain-query";
import { DomainStatus, OwnedDomainStatus } from "./types";

export class ObservableQueryDomainStatusInner extends ObservableCosmwasmContractChainQuery<DomainStatus> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected override readonly contractAddress: string,
    protected readonly domain: string
  ) {
    super(kvStore, chainId, chainGetter, contractAddress, {
      get_domain_status: { domain: domain },
    });
  }

  @computed
  get domain_status(): OwnedDomainStatus | string {
    return this.response?.data?.domain_status || "";
  }
  get registrationTime(): string {
    if (!this.domain_status || typeof this.domain_status === "string")
      return "";
    return this.domain_status?.Owned?.registration_time;
  }
}

export class ObservableQueryDomainStatus extends ObservableChainQueryMap<DomainStatus> {
  constructor(
    protected override readonly kvStore: KVStore,
    protected override readonly chainId: string,
    protected override readonly chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (key: string) => {
      const split = key.split("/");
      return new ObservableQueryDomainStatusInner(
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
  ): ObservableQueryDomainStatusInner {
    return this.get(
      `${contractAddress}/${domain}`
    ) as ObservableQueryDomainStatusInner;
  }
}
