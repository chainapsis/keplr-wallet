import { ObservableCosmwasmContractChainQuery } from "../cosmwasm/contract-query";
import { ChainGetter } from "../../chain";
import { computed } from "mobx";
import { ObservableChainQueryMap } from "../chain-query";
import { ICNSNames } from "./types";
import { QuerySharedContext } from "../../common";

export class ObservableQueryICNSNamesInner extends ObservableCosmwasmContractChainQuery<ICNSNames> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    contractAddress: string,
    protected readonly address: string
  ) {
    super(sharedContext, chainId, chainGetter, contractAddress, {
      icns_names: { address: address },
    });
  }

  protected override canFetch(): boolean {
    return this.address !== "";
  }

  @computed
  get primaryName(): string {
    if (!this.response || !this.response.data) {
      return "";
    }

    return this.response.data.primary_name;
  }

  @computed
  get names(): string[] {
    if (!this.response || !this.response.data) {
      return [];
    }

    return this.response.data.names;
  }
}

export class ObservableQueryICNSNames extends ObservableChainQueryMap<ICNSNames> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, (key: string) => {
      const split = key.split("/");
      return new ObservableQueryICNSNamesInner(
        this.sharedContext,
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
  ): ObservableQueryICNSNamesInner {
    return this.get(
      `${contractAddress}/${address}`
    ) as ObservableQueryICNSNamesInner;
  }
}
