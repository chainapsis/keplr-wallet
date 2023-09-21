import {
  ChainGetter,
  HasMapStore,
  ObservableQuery,
  QuerySharedContext,
} from "@keplr-wallet/stores";
import { RouteResponse } from "./types";
import { simpleFetch } from "@keplr-wallet/simple-fetch";
import { makeObservable } from "mobx";
import { CoinPretty } from "@keplr-wallet/unit";

export class ObservableQueryRouteInner extends ObservableQuery<RouteResponse> {
  constructor(
    sharedContext: QuerySharedContext,
    protected readonly chainGetter: ChainGetter,
    skipURL: string,
    public readonly sourceChainId: string,
    public readonly sourceAmount: string,
    public readonly sourceDenom: string,
    public readonly destChainId: string,
    public readonly destDenom: string,
    public readonly cumulativeAffiliateFeeBps: number
  ) {
    super(sharedContext, skipURL, "/v1/fungible/route");

    makeObservable(this);
  }

  protected override async fetchResponse(
    abortController: AbortController
  ): Promise<{ headers: any; data: RouteResponse }> {
    const result = await simpleFetch<RouteResponse>(this.baseURL, this.url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        amount_in: this.sourceAmount,
        source_asset_denom: this.sourceDenom,
        source_asset_chain_id: this.sourceChainId,
        dest_asset_denom: this.destDenom,
        dest_asset_chain_id: this.destChainId,
        cumulative_affiliate_fee_bps: this.cumulativeAffiliateFeeBps.toString(),
      }),
      signal: abortController.signal,
    });

    return {
      headers: result.headers,
      data: result.data,
    };
  }

  protected override getCacheKey(): string {
    return `${super.getCacheKey()}-${JSON.stringify({
      amount_in: this.sourceAmount,
      source_asset_denom: this.sourceDenom,
      source_asset_chain_id: this.sourceChainId,
      dest_asset_denom: this.destDenom,
      dest_asset_chain_id: this.destChainId,
      cumulative_affiliate_fee_bps: this.cumulativeAffiliateFeeBps.toString(),
    })}`;
  }
}

export class ObservableQueryRoute extends HasMapStore<ObservableQueryRouteInner> {
  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainGetter: ChainGetter,
    protected readonly skipURL: string
  ) {
    super((str) => {
      const parsed = JSON.parse(str);
      return new ObservableQueryRouteInner(
        this.sharedContext,
        this.chainGetter,
        this.skipURL,
        parsed.sourceChainId,
        parsed.sourceAmount,
        parsed.sourceDenom,
        parsed.destChainId,
        parsed.destDenom,
        parsed.cumulativeAffiliateFeeBps
      );
    });
  }

  getRoute(
    sourceChainId: string,
    amount: CoinPretty,
    destChainId: string,
    destDenom: string,
    cumulativeAffiliateFeeBps: number = 0
  ): ObservableQueryRouteInner {
    const str = JSON.stringify({
      sourceChainId,
      sourceAmount: amount.toCoin().amount,
      sourceDenom: amount.currency.coinMinimalDenom,
      destChainId,
      destDenom,
      cumulativeAffiliateFeeBps,
    });
    return this.get(str);
  }
}
