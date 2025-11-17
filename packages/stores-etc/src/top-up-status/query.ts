import {
  ObservableQuery,
  QuerySharedContext,
  HasMapStore,
} from "@keplr-wallet/stores";
import { computed, makeObservable } from "mobx";

export type TopUpStatus = {
  isTopUpAvailable: boolean;
  remainingTimeMs?: number;
};

export type StatusResponse = TopUpStatus | { error: string };

class ObservableQueryTopUpStatusInner extends ObservableQuery<StatusResponse> {
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
        disableCache: true,
        fetchingInterval: 10_000,
      }
    );

    makeObservable(this);
  }

  @computed
  get topUpStatus(): TopUpStatus | undefined {
    if (
      this.error ||
      !this.response?.data ||
      (this.isFetching &&
        Math.abs(this.response.timestamp - Date.now()) > 30 * 1000)
    ) {
      return undefined;
    }

    if ("error" in this.response?.data) {
      return undefined;
    }

    return this.response.data;
  }
}

export class ObservableQueryTopUpStatus extends HasMapStore<ObservableQueryTopUpStatusInner> {
  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainId: string,
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
