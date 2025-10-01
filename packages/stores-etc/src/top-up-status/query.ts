import { ObservableQuery, QuerySharedContext } from "@keplr-wallet/stores";
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
  private readonly chainId: string;

  constructor(
    sharedContext: QuerySharedContext,
    baseURL: string,
    chainId: string
  ) {
    super(sharedContext, baseURL, `/status/${encodeURIComponent(chainId)}`, {
      cacheMaxAge: 0,
      fetchingInterval: 10_000,
    });

    this.chainId = chainId;

    makeObservable(this);
  }

  setRecipientAddress(recipientAddress: string) {
    this.setUrl(
      `/status/${encodeURIComponent(
        this.chainId
      )}?recipientAddress=${encodeURIComponent(recipientAddress)}`
    );
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

export class ObservableQueryTopUpStatus extends ObservableQueryTopUpStatusInner {
  constructor(
    sharedContext: QuerySharedContext,
    baseURL: string,
    chainId: string
  ) {
    super(sharedContext, baseURL, chainId);
  }
}
