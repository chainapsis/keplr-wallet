import {
  ChainGetter,
  HasMapStore,
  ObservableQuery,
  QuerySharedContext,
} from "@keplr-wallet/stores";
import { AppCurrency } from "@keplr-wallet/types";
import { makeObservable } from "mobx";

export class ObservableQuerySkipTokenInfoInner extends ObservableQuery<AppCurrency> {
  constructor(
    sharedContext: QuerySharedContext,
    baseURL: string,
    apiURI: string,
    chainId: string,
    coinMinimalDenom: string
  ) {
    super(
      sharedContext,
      baseURL,
      apiURI
        .replace("{chainId}", chainId)
        .replace("{coinMinimalDenom}", coinMinimalDenom)
    );

    makeObservable(this);
  }

  get currency(): AppCurrency | undefined {
    return this.response?.data;
  }
}

export class ObservableQuerySkipTokenInfo extends HasMapStore<ObservableQuerySkipTokenInfoInner> {
  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter,
    protected readonly baseURL: string,
    protected readonly apiURI: string
  ) {
    super((coinMinimalDenom: string) => {
      return new ObservableQuerySkipTokenInfoInner(
        this.sharedContext,
        this.baseURL,
        this.apiURI,
        this.chainId,
        coinMinimalDenom
      );
    });
  }

  getQueryCoinMinimalDenom(
    coinMinimalDenom: string
  ): ObservableQuerySkipTokenInfoInner {
    return this.get(coinMinimalDenom) as ObservableQuerySkipTokenInfoInner;
  }
}
