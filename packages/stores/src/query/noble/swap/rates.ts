import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { ChainGetter } from "../../../chain";
import { computed, makeObservable } from "mobx";
import { QuerySharedContext } from "../../../common";
import { NobleSwapRate } from "./types";

export class ObservableQueryNobleSwapRatesInner extends ObservableChainQuery<{
  rates: NobleSwapRate[];
}> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    coinMinimalDenom: string
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      `/noble/swap/v1/rates/${coinMinimalDenom}`
    );

    makeObservable(this);
  }

  @computed
  get rates(): NobleSwapRate[] {
    return this.response?.data.rates ?? [];
  }
}
export class ObservableQueryNobleSwapRates extends ObservableChainQueryMap<{
  rates: NobleSwapRate[];
}> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, (coinMinimalDenom: string) => {
      return new ObservableQueryNobleSwapRatesInner(
        this.sharedContext,
        this.chainId,
        this.chainGetter,
        coinMinimalDenom
      );
    });
  }

  getQueryCoinMinimalDenom(
    coinMinimalDenom: string
  ): ObservableQueryNobleSwapRatesInner {
    return this.get(coinMinimalDenom) as ObservableQueryNobleSwapRatesInner;
  }
}
