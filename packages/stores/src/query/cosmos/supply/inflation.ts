import { computed, makeObservable } from "mobx";
import { Dec, DecUtils, Int, IntPretty } from "@keplr-wallet/unit";
import { ObservableQuerySupplyTotal } from "./supply";
import { MintingInflation } from "./types";
import { StakingPool } from "../staking/types";
import { ObservableChainQuery } from "../../chain-query";

export class ObservableQueryInflation {
  constructor(
    private readonly _queryMint: ObservableChainQuery<MintingInflation>,
    private readonly _queryPool: ObservableChainQuery<StakingPool>,
    private readonly _querySupplyTotal: ObservableQuerySupplyTotal
  ) {
    makeObservable(this);
  }

  get error() {
    return (
      this._queryMint.error ??
      this._queryPool.error ??
      this._querySupplyTotal.getQueryStakeDenom().error
    );
  }

  get isFetching() {
    return (
      this._queryMint.isFetching ||
      this._queryPool.isFetching ||
      this._querySupplyTotal.getQueryStakeDenom().isFetching
    );
  }

  // Return an inflation as `IntPrety`.
  // If the staking pool info is fetched, this will consider this info for calculating the more accurate value.
  @computed
  get inflation(): IntPretty {
    if (!this._queryMint.response) {
      return new IntPretty(new Int(0)).ready(false);
    }

    let dec = new Dec(this._queryMint.response.data.result).mul(
      DecUtils.getPrecisionDec(2)
    );
    if (
      this._queryPool.response &&
      this._querySupplyTotal.getQueryStakeDenom().response
    ) {
      const bondedToken = new Dec(
        this._queryPool.response.data.result.bonded_tokens
      );
      const totalStr = (() => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const response = this._querySupplyTotal.getQueryStakeDenom().response!
          .data.result;

        if (typeof response === "string") {
          return response;
        } else {
          return response.amount;
        }
      })();
      const total = new Dec(totalStr);
      if (total.gt(new Dec(0))) {
        const ratio = bondedToken.quo(total);

        dec = dec.quo(ratio);
        // TODO: Rounding?
      }
    }

    return new IntPretty(dec);
  }
}
