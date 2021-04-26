import { Secret20ContractTokenInfo } from "./types";
import { KVStore } from "@keplr-wallet/common";
import { ObservableChainQueryMap } from "../chain-query";
import { ChainGetter, QueryError } from "../../common";
import { ObservableQuerySecretContractCodeHash } from "./contract-hash";
import { computed, makeObservable } from "mobx";
import { ObservableSecretContractChainQuery } from "./contract-query";
import { Keplr } from "@keplr-wallet/types";

export class ObservableQuerySecret20ContactInfoInner extends ObservableSecretContractChainQuery<Secret20ContractTokenInfo> {
  protected nonce?: Uint8Array;

  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly apiGetter: () => Promise<Keplr | undefined>,
    protected readonly contractAddress: string,
    protected readonly querySecretContractCodeHash: ObservableQuerySecretContractCodeHash
  ) {
    // Don't need to set the url initially because it can't request without encyption.
    super(
      kvStore,
      chainId,
      chainGetter,
      apiGetter,
      contractAddress,
      { token_info: {} },
      querySecretContractCodeHash
    );
    makeObservable(this);
  }

  get error(): Readonly<QueryError<unknown>> | undefined {
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
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter,
    protected readonly apiGetter: () => Promise<Keplr | undefined>,
    protected readonly querySecretContractCodeHash: ObservableQuerySecretContractCodeHash
  ) {
    super(kvStore, chainId, chainGetter, (contractAddress: string) => {
      return new ObservableQuerySecret20ContactInfoInner(
        this.kvStore,
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
