import { SecretContractCodeHash } from "./types";
import { KVStore } from "@keplr-wallet/common";
import { ObservableChainQuery, ObservableChainQueryMap } from "../chain-query";
import { ChainGetter } from "../../common";

export class ObservableQuerySecretContractCodeHashInner extends ObservableChainQuery<SecretContractCodeHash> {
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
      `/compute/v1beta1/code_hash/by_contract_address/${contractAddress}`
    );
  }

  protected override canFetch(): boolean {
    return this.contractAddress.length > 0;
  }
}

export class ObservableQuerySecretContractCodeHash extends ObservableChainQueryMap<SecretContractCodeHash> {
  constructor(
    protected override readonly kvStore: KVStore,
    protected override readonly chainId: string,
    protected override readonly chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (contractAddress: string) => {
      return new ObservableQuerySecretContractCodeHashInner(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        contractAddress
      );
    });
  }

  getQueryContract(
    contractAddress: string
  ): ObservableQuerySecretContractCodeHashInner {
    return this.get(
      contractAddress
    ) as ObservableQuerySecretContractCodeHashInner;
  }
}
