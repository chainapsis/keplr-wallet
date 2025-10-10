import {
  ObservableQuery,
  QuerySharedContext,
  ChainGetter,
  HasMapStore,
} from "@keplr-wallet/stores";
import { makeObservable } from "mobx";

export type StatusResponseBody =
  | {
      isTopUpAvailable: boolean;
      remainingTimeMs?: number;
    }
  | {
      error: string;
    };

class ObservableQueryTopUpStatusInner extends ObservableQuery<StatusResponseBody> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    baseURL: string,
    recipientAddress: string
  ) {
    super(
      sharedContext,
      baseURL,
      `status/${encodeURIComponent(
        chainId
      )}?recipientAddress=${encodeURIComponent(recipientAddress)}`,
      {
        cacheMaxAge: 0,
        fetchingInterval: 10_000,
      }
    );

    makeObservable(this);
  }

  get topUpStatus(): { isTopUpAvailable: boolean; remainingTimeMs?: number } {
    if (!this.response?.data) {
      return {
        isTopUpAvailable: false,
        remainingTimeMs: undefined,
      };
    }

    if ("error" in this.response?.data) {
      return {
        isTopUpAvailable: false,
        remainingTimeMs: undefined,
      };
    }

    return this.response.data;
  }
}

export class ObservableQueryTopUpStatus extends HasMapStore<ObservableQueryTopUpStatusInner> {
  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter,
    protected readonly baseURL: string
  ) {
    super((recipientAddress: string) => {
      return new ObservableQueryTopUpStatusInner(
        this.sharedContext,
        this.chainId,
        this.baseURL,
        recipientAddress
      );
    });
  }

  getTopUpStatus(recipientAddress: string): ObservableQueryTopUpStatusInner {
    return this.get(recipientAddress);
  }
}
