import { ObservableCosmwasmContractChainQuery } from "../cosmwasm/contract-query";
import { KVStore } from "@keplr-wallet/common";
import { ChainGetter } from "../../common";
import { computed } from "mobx";
import { ObservableChainQueryMap } from "../chain-query";
import { DomainsByBeneficiary } from "./types";

export class ObservableQueryDomainsByBeneficiaryInner extends ObservableCosmwasmContractChainQuery<DomainsByBeneficiary> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected override readonly contractAddress: string,
    protected readonly address: string
  ) {
    super(kvStore, chainId, chainGetter, contractAddress, {
      reverse_look_up: { target: address },
    });
  }

  @computed
  get domains(): string[] {
    if (!this.response || !this.response.data.domains) {
      return [];
    }

    return this.response.data.domains;
  }
}

export class ObservableQueryDomainsByBeneficiary extends ObservableChainQueryMap<DomainsByBeneficiary> {
  constructor(
    protected override readonly kvStore: KVStore,
    protected override readonly chainId: string,
    protected override readonly chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (key: string) => {
      const split = key.split("/");
      return new ObservableQueryDomainsByBeneficiaryInner(
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
    address: string
  ): ObservableQueryDomainsByBeneficiaryInner {
    return this.get(
      `${contractAddress}/${address}`
    ) as ObservableQueryDomainsByBeneficiaryInner;
  }
}
