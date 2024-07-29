import { ChainGetter, QuerySharedContext } from "@keplr-wallet/stores";
import { computed, makeObservable } from "mobx";
import { ObservableEvmChainJsonRpcQuery } from "./evm-chain-json-rpc";

export class ObservableQueryEthereumGasPrice extends ObservableEvmChainJsonRpcQuery<string> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, "eth_gasPrice", []);

    makeObservable(this);
  }

  @computed
  get gasPrice(): string | undefined {
    if (!this.response) {
      return;
    }

    return this.response.data;
  }
}
