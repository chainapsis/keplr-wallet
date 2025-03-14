import { ChainGetter, QuerySharedContext } from "@keplr-wallet/stores";
import { FeeEstimates, Fees } from "../types";
import { ObservableBitcoinIndexerQuery } from "../bitcoin-indexer";
import { makeObservable } from "mobx";
export class ObservableQueryBitcoinFeeEstimates extends ObservableBitcoinIndexerQuery<FeeEstimates> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, "fee-estimates");

    makeObservable(this);
  }

  get fees(): Fees {
    const DEFAULT_FEES = {
      fastestFee: 10,
      halfHourFee: 5,
      hourFee: 3,
      economyFee: 2,
      minimumFee: 1,
    };

    if (!this.response || !this.response.data) {
      return DEFAULT_FEES;
    }

    const data = this.response.data;

    const sortedKeys = Object.keys(data)
      .map(Number)
      .sort((a, b) => a - b);

    if (sortedKeys.length === 0) {
      return DEFAULT_FEES;
    }

    const getFeeForTarget = (target: number): number => {
      if (data[target.toString()]) {
        return data[target.toString()];
      }

      if (sortedKeys.length === 0) {
        return 1; // minimum fee
      }

      let closest = sortedKeys[0];
      for (const key of sortedKeys) {
        if (Math.abs(key - target) < Math.abs(closest - target)) {
          closest = key;
        }
      }

      return data[closest.toString()];
    };

    const minimumFee =
      sortedKeys.length > 0
        ? data[sortedKeys[sortedKeys.length - 1].toString()]
        : 1;

    return {
      fastestFee: getFeeForTarget(1),
      halfHourFee: getFeeForTarget(3),
      hourFee: getFeeForTarget(6),
      economyFee: getFeeForTarget(12),
      minimumFee,
    };
  }
}
