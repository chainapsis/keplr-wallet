import { ObservableCosmwasmContractChainQuery } from "../cosmwasm/contract-query";
import { KVStore } from "@keplr-wallet/common";
import { ChainGetter } from "../../common";
import { computed } from "mobx";
import { ObservableChainQueryMap } from "../chain-query";
import { DomainsOwnedBy } from "./types";

export class ObservableQueryAllDomainsOwnedByInner extends ObservableCosmwasmContractChainQuery<DomainsOwnedBy> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected override readonly contractAddress: string,
    protected readonly owner: string
  ) {
    super(kvStore, chainId, chainGetter, contractAddress, {
      get_all_domains_owned_by: { owner: owner },
    });
  }

  @computed
  get domains(): string[] {
    return this.response?.data?.domains || [];
  }

  get ownerAddress(): string {
    return this.response?.data?.owner || "";
  }
}

export class ObservableQueryAllDomainsOwnedBy extends ObservableChainQueryMap<DomainsOwnedBy> {
  constructor(
    protected override readonly kvStore: KVStore,
    protected override readonly chainId: string,
    protected override readonly chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (key: string) => {
      const split = key.split("/");
      return new ObservableQueryAllDomainsOwnedByInner(
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
    owner: string
  ): ObservableQueryAllDomainsOwnedByInner {
    return this.get(
      `${contractAddress}/${owner}`
    ) as ObservableQueryAllDomainsOwnedByInner;
  }
}
