import {
  ObservableQuery,
  QuerySharedContext,
  ChainGetter,
  HasMapStore,
} from "@keplr-wallet/stores";
import { makeObservable } from "mobx";

export type StatusResponse =
  | {
      isTopUpAvailable: boolean;
      remainingTimeMs?: number;
    }
  | {
      error: string;
    };

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
      }
    );

    makeObservable(this);
  }

  get topUpStatus(): StatusResponse | undefined {
    return this.response?.data;
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
