import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { ChainGetter } from "../../../chain";
import { computed, makeObservable } from "mobx";
import { QuerySharedContext } from "../../../common";
import { NobleSwapSimulateSwap } from "./types";
import { CoinPretty } from "@keplr-wallet/unit";
import { simpleFetch } from "@keplr-wallet/simple-fetch";
import { Coin } from "@keplr-wallet/types";

export class ObservableQueryNobleSwapSimulateSwapInner extends ObservableChainQuery<NobleSwapSimulateSwap> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly signer: string,
    protected readonly amount: Coin,
    protected readonly routes: {
      pool_id: number;
      denom_to: string;
    }[],
    protected readonly min: Coin
  ) {
    super(sharedContext, chainId, chainGetter, `/noble/swap/v1/simulate_swap`);

    makeObservable(this);
  }

  protected override async fetchResponse(
    abortController: AbortController
  ): Promise<{ headers: any; data: NobleSwapSimulateSwap }> {
    const result = await simpleFetch<NobleSwapSimulateSwap>(
      this.baseURL,
      this.url,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          signer: this.signer,
          amount: this.amount,
          routes: this.routes,
          min: this.min,
        }),
        signal: abortController.signal,
      }
    );

    return {
      headers: result.headers,
      data: result.data,
    };
  }

  protected override getCacheKey(): string {
    return `${super.getCacheKey()}-${JSON.stringify({
      signer: this.signer,
      amount: this.amount,
      routes: this.routes,
      min: this.min,
    })}`;
  }

  @computed
  get simulatedOutAmount(): CoinPretty | undefined {
    if (!this.response) {
      return;
    }

    return new CoinPretty(
      this.chainGetter
        .getChain(this.chainId)
        .forceFindCurrency(this.response.data.result.denom),
      this.response.data.result.amount
    );
  }
}

export class ObservableQueryNobleSwapSimulateSwap extends ObservableChainQueryMap<NobleSwapSimulateSwap> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, (key: string) => {
      const { signer, amount, routes, min } = JSON.parse(key);

      return new ObservableQueryNobleSwapSimulateSwapInner(
        this.sharedContext,
        this.chainId,
        this.chainGetter,
        signer,
        amount,
        routes,
        min
      );
    });
  }

  getQuery(
    signer: string,
    amount: Coin,
    routes: {
      pool_id: number;
      denom_to: string;
    }[],
    min: Coin
  ): ObservableQueryNobleSwapSimulateSwapInner {
    return this.get(
      JSON.stringify({
        signer,
        amount,
        routes,
        min,
      })
    ) as ObservableQueryNobleSwapSimulateSwapInner;
  }
}
