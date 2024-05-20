import {
  HasMapStore,
  ObservableQuery,
  QuerySharedContext,
} from "@keplr-wallet/stores";
import { computed, makeObservable } from "mobx";
import { ChainIdHelper } from "@keplr-wallet/cosmos";

export type SwapUsageResponse = string[];

export class ObservableQuerySwapUsageInner extends ObservableQuery<SwapUsageResponse> {
  constructor(
    sharedContext: QuerySharedContext,
    baseURL: string,
    chainIdentifier: string
  ) {
    super(sharedContext, baseURL, `/swap-usage/denoms/${chainIdentifier}`);

    makeObservable(this);
  }

  get denoms(): string[] {
    if (!this.response) {
      return [];
    }

    return this.response.data;
  }

  @computed
  get denomMap(): Map<string, boolean> {
    const map = new Map<string, boolean>();
    for (const denom of this.denoms) {
      map.set(denom, true);
    }

    return map;
  }

  isSwappable(denom: string): boolean {
    return this.denomMap.has(denom);
  }
}

export class ObservableQuerySwapUsage extends HasMapStore<ObservableQuerySwapUsageInner> {
  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly baseURL: string
  ) {
    super((str) => {
      return new ObservableQuerySwapUsageInner(
        this.sharedContext,
        baseURL,
        str
      );
    });
  }

  getSwapUsage(chainIdentifier: string): ObservableQuerySwapUsageInner {
    return this.get(ChainIdHelper.parse(chainIdentifier).identifier);
  }
}
