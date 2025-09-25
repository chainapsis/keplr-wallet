import {
  HasMapStore,
  ObservableQuery,
  QuerySharedContext,
} from "@keplr-wallet/stores";
import { computed, makeObservable } from "mobx";

export type TopUpStatusResponse =
  | {
      ok: true;
      status: boolean;
    }
  | {
      ok: false;
      error: string;
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

  @computed
  get isOk(): boolean {
    const data = this.response?.data;
    return Boolean(data?.ok);
  }

  @computed
  get isTopUpPossible(): boolean | undefined {
    const data = this.response?.data;
    if (!data || !data.ok) {
      return undefined;
    }

    return data.status;
  }

  @computed
  get errorMessage(): string | undefined {
    const data = this.response?.data;
    if (!data || data.ok) {
      return undefined;
    }

    return data.error;
  }
}

export class ObservableQueryTopUpStatus extends HasMapStore<ObservableQueryTopUpStatusInner> {
  constructor(sharedContext: QuerySharedContext, baseURL: string) {
    super(
      (chainId: string) =>
        new ObservableQueryTopUpStatusInner(sharedContext, baseURL, chainId)
    );
  }

  getQuery(chainId: string): ObservableQueryTopUpStatusInner {
    return this.get(chainId) as ObservableQueryTopUpStatusInner;
  }
}
