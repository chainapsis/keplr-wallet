import { ObservableQuery, QuerySharedContext } from "@keplr-wallet/stores";
import { makeObservable } from "mobx";

export type TopUpStatusResponse = {
  status: boolean;
  error?: string;
  // remainingSeconds?: number;
};

class ObservableQueryTopUpStatusInner extends ObservableQuery<TopUpStatusResponse> {
  constructor(
    sharedContext: QuerySharedContext,
    baseURL: string,
    chainId: string
  ) {
    super(sharedContext, baseURL, `/status/${encodeURIComponent(chainId)}`, {
      cacheMaxAge: 0,
      fetchingInterval: 10_000,
    });

    makeObservable(this);
  }
}

export class ObservableQueryTopUpStatus extends ObservableQueryTopUpStatusInner {
  constructor(
    sharedContext: QuerySharedContext,
    baseURL: string,
    chainId: string
  ) {
    super(sharedContext, baseURL, chainId);
  }
}
