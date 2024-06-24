import { ObservableChainQuery } from "../../chain-query";
import { GasPrices } from "./types";
import { QuerySharedContext } from "../../../common";
import { ChainGetter } from "../../../chain";
import { makeObservable } from "mobx";
import { Dec } from "@keplr-wallet/unit";

export class ObservableQueryFeeMarketGasPrices extends ObservableChainQuery<GasPrices> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, "/feemarket/v1/gas_prices");

    makeObservable(this);
  }

  get gasPrices(): {
    denom: string;
    amount: Dec;
  }[] {
    if (!this.response || !this.response.data.prices) {
      return [];
    }

    return this.response.data.prices.map((price) => {
      return {
        denom: price.denom,
        amount: new Dec(price.amount),
      };
    });
  }
}
