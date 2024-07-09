import { ChainGetter, QuerySharedContext } from "@keplr-wallet/stores";
import { computed, makeObservable } from "mobx";
import { ObservableEvmChainJsonRpcQuery } from "./evm-chain-json-rpc";

export class ObservableQueryEthereumMaxPriorityFee extends ObservableEvmChainJsonRpcQuery<string> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, "eth_maxPriorityFeePerGas", []);

    makeObservable(this);
  }

  @computed
  get maxPriorityFeePerGas(): string | undefined {
    if (!this.response) {
      return;
    }

    return this.response.data;
  }
}
