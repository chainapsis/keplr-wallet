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
      `/wasm/contract/${contractAddress}/code-hash`
    );
  }

  protected canFetch(): boolean {
    return this.contractAddress.length > 0;
  }
}

export class ObservableQuerySecretContractCodeHash extends ObservableChainQueryMap<SecretContractCodeHash> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
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
