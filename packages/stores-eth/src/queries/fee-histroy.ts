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
  rewardPercentiles: number[];

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

    this.rewardPercentiles = rewardPercentiles;
  }

  @computed
  get feeHistory(): EthereumFeeHistory | undefined {
    if (!this.response) {
      return;
    }

    return this.response.data;
  }

  @computed
  get reasonableMaxPriorityFeePerGas():
    | Array<{
        percentile: number;
        value: bigint;
      }>
    | undefined {
    if (!this.feeHistory?.reward || this.feeHistory.reward.length === 0) {
      return;
    }

    const rewards = this.feeHistory.reward;

    const results: {
      percentile: number;
      value: bigint;
    }[] = [];

    const percentiles = this.rewardPercentiles;
    const deviationThreshold = BigInt(1 * 10 ** 9); // 1 Gwei

    for (let idx = 0; idx < percentiles.length; idx++) {
      const vals = rewards
        .map((block) => block[idx])
        .filter((v) => v != null)
        .map((v) => BigInt(v));

      if (vals.length === 0) continue;

      const sum = vals.reduce((acc, x) => acc + x, BigInt(0));
      const mean = sum / BigInt(vals.length);

      vals.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
      const median = vals[Math.floor(vals.length / 2)];

      const deviation = mean > median ? mean - median : median - mean;
      const pick =
        deviation > deviationThreshold ? (mean > median ? mean : median) : mean;

      results.push({
        percentile: percentiles[idx],
        value: pick,
      });
    }

    return results.length > 0 ? results : undefined;
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
