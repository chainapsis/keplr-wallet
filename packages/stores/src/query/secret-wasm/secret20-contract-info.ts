import { Secret20ContractTokenInfo } from "./types";
import { ObservableChainQueryMap } from "../chain-query";
import { QueryError, QuerySharedContext } from "../../common";
import { ChainGetter } from "../../chain";
import { ObservableQuerySecretContractCodeHash } from "./contract-hash";
import { computed, makeObservable } from "mobx";
import { ObservableSecretContractChainQuery } from "./contract-query";
import { Keplr } from "@keplr-wallet/types";

export class ObservableQuerySecret20ContactInfoInner extends ObservableSecretContractChainQuery<Secret20ContractTokenInfo> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    apiGetter: () => Promise<Keplr | undefined>,
    contractAddress: string,
    querySecretContractCodeHash: ObservableQuerySecretContractCodeHash
  ) {
    // Don't need to set the url initially because it can't request without encyption.
    super(
      sharedContext,
      chainId,
      chainGetter,
      apiGetter,
      contractAddress,
      { token_info: {} },
      querySecretContractCodeHash
    );
    makeObservable(this);
  }

  override get error(): Readonly<QueryError<unknown>> | undefined {
    return (
      super.error ||
      this.querySecretContractCodeHash.getQueryContract(this.contractAddress)
        .error
    );
  }

  @computed
  get tokenInfo(): Secret20ContractTokenInfo["token_info"] | undefined {
    if (!this.response) {
      return undefined;
    }

    return this.response.data.token_info;
  }
}

export class ObservableQuerySecret20ContractInfo extends ObservableChainQueryMap<Secret20ContractTokenInfo> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly apiGetter: () => Promise<Keplr | undefined>,
    protected readonly querySecretContractCodeHash: ObservableQuerySecretContractCodeHash
  ) {
    super(sharedContext, chainId, chainGetter, (contractAddress: string) => {
      return new ObservableQuerySecret20ContactInfoInner(
        this.sharedContext,
        this.chainId,
        this.chainGetter,
        this.apiGetter,
        contractAddress,
        querySecretContractCodeHash
      );
    });
  }

  getQueryContract(
    contractAddress: string
  ): ObservableQuerySecret20ContactInfoInner {
    return this.get(contractAddress) as ObservableQuerySecret20ContactInfoInner;
  }
}
