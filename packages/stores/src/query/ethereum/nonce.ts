import { ChainGetter } from "../../chain";
import { computed, makeObservable } from "mobx";
import { QuerySharedContext } from "../../common";
import {
  ObservableChainQueryJSONRPC,
  ObservableChainQueryJSONRPCMap,
} from "../chain-json-rpc-query";

export interface EthereumNonceResult {
  result: number;
}

export class ObservableQueryEthereumNonceInner extends ObservableChainQueryJSONRPC<EthereumNonceResult> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly ethereumAddress: string,
    protected readonly blockNumber?: string
  ) {
    super(sharedContext, chainId, chainGetter, "", {
      jsonrpc: "2.0",
      method: "eth_getTransactionCount",
      params: [ethereumAddress, blockNumber ?? "latest"],
      id: 1,
    });

    makeObservable(this);
  }

  @computed
  get nonce(): number {
    if (!this.response) {
      return 0;
    }

    return this.response.data.result;
  }
}

export class ObservableQueryEthereumNonce extends ObservableChainQueryJSONRPCMap<EthereumNonceResult> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, (key: string) => {
      const splitedKey = key.split("/");
      return new ObservableQueryEthereumNonceInner(
        this.sharedContext,
        this.chainId,
        this.chainGetter,
        splitedKey[0],
        splitedKey[1]
      );
    });
  }

  getQueryEthereumNonce(
    ethereumAddress: string,
    blockNumber?: string
  ): ObservableQueryEthereumNonceInner {
    const key = `${ethereumAddress}/${blockNumber ?? "latest"}`;
    return this.get(key) as ObservableQueryEthereumNonceInner;
  }
}
