import { ChainGetter, QuerySharedContext } from "@keplr-wallet/stores";
import { computed, makeObservable } from "mobx";
import {
  ObservableEvmChainJsonRpcQuery,
  ObservableEvmChainJsonRpcQueryMap,
} from "./evm-chain-json-rpc";

interface EthereumFeeHistory {
  oldestBlock: string;
  baseFeePerGas?: string[];
  gasUsedRatio: number[];
  reward?: string[][];
}

export class ObservableQueryEthereumFeeHistoryInner extends ObservableEvmChainJsonRpcQuery<EthereumFeeHistory> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    blockCount: string | number,
    newestBlock: string,
    rewardPercentiles: number[]
  ) {
    const hexBlockCount =
      typeof blockCount === "string"
        ? blockCount
        : `0x${blockCount.toString(16)}`;

    super(sharedContext, chainId, chainGetter, "eth_feeHistory", [
      hexBlockCount,
      newestBlock,
      rewardPercentiles,
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

export class ObservableQueryEthereumFeeHistory extends ObservableEvmChainJsonRpcQueryMap<EthereumFeeHistory> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, (stringifiedParams: string) => {
      const params = (() => {
        try {
          return JSON.parse(stringifiedParams);
        } catch {
          throw new Error("Invalid JSON RPC params");
        }
      })();
      const blockCount = params[0];
      const newestBlock = params[1];
      const rewardPercentiles = params[2];

      return new ObservableQueryEthereumFeeHistoryInner(
        this.sharedContext,
        this.chainId,
        this.chainGetter,
        blockCount,
        newestBlock,
        rewardPercentiles
      );
    });
  }

  getQueryByFeeHistoryParams(
    blockCount: string | number,
    newestBlock: string,
    rewardPercentiles: number[]
  ): ObservableQueryEthereumFeeHistoryInner {
    const key = JSON.stringify([blockCount, newestBlock, rewardPercentiles]);
    return this.get(key) as ObservableQueryEthereumFeeHistoryInner;
  }
}
