import { ChainGetter, QuerySharedContext } from "@keplr-wallet/stores";
import { computed, makeObservable } from "mobx";
import { ObservableEvmChainJsonRpcQuery } from "./evm-chain-json-rpc";

interface EthereumFeeHistory {
  oldestBlock: string;
  baseFeePerGas?: string[];
  gasUsedRatio: number[];
  reward?: string[][];
}

export class ObservableQueryEthereumFeeHistory extends ObservableEvmChainJsonRpcQuery<EthereumFeeHistory> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, "eth_feeHistory", [
      5,
      "latest",
      [10, 20, 30],
    ]);

    makeObservable(this);
  }

  @computed
  get feeHistory(): EthereumFeeHistory | undefined {
    if (!this.response) {
      return;
    }

    return this.response.data;
  }
}
