import { SecretContractCodeHash } from "./types";
import { ObservableChainQuery, ObservableChainQueryMap } from "../chain-query";
import { ChainGetter } from "../../chain";
import { QuerySharedContext } from "../../common";

export class ObservableQuerySecretContractCodeHashInner extends ObservableChainQuery<SecretContractCodeHash> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly contractAddress: string
  ) {
    super(
      sharedContext,
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
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, (contractAddress: string) => {
      return new ObservableQuerySecretContractCodeHashInner(
        this.sharedContext,
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
