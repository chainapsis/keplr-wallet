import {
  ChainGetter,
  HasMapStore,
  ObservableQuery,
  QuerySharedContext,
} from "@keplr-wallet/stores";
import { makeObservable } from "mobx";
export class ObservableQueryCoingeckoTokenInfoInner extends ObservableQuery<{
  id: string;
  symbol: string;
  image: {
    small: string;
  };
  detail_platforms: Record<
    string,
    {
      decimal_place: number;
    }
  >;
}> {
  constructor(
    sharedContext: QuerySharedContext,
    coingeckoAPIBaseURL: string,
    coingeckoAPIURI: string,
    protected readonly coingeckoChainId: string,
    contractAddress: string
  ) {
    super(
      sharedContext,
      coingeckoAPIBaseURL,
      coingeckoAPIURI
        .replace("{coingeckoChainId}", coingeckoChainId)
        .replace("{contractAddress}", contractAddress)
    );

    makeObservable(this);
  }

  get symbol(): string | undefined {
    return this.response?.data?.symbol.toUpperCase();
  }

  get decimals(): number | undefined {
    return this.response?.data?.detail_platforms[this.coingeckoChainId]
      ?.decimal_place;
  }

  get coingeckoId(): string | undefined {
    return this.response?.data?.id;
  }

  get logoURI(): string | undefined {
    return this.response?.data?.image.small;
  }
}

export class ObservableQueryCoingeckoTokenInfo extends HasMapStore<
  ObservableQueryCoingeckoTokenInfoInner | undefined
> {
  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter,
    protected readonly coingeckoAPIBaseURL: string,
    protected readonly coingeckoAPIURI: string
  ) {
    const coingeckoChainId = coingeckoChainIdMap[chainId];

    super((contractAddress: string) => {
      if (coingeckoChainId != null) {
        return new ObservableQueryCoingeckoTokenInfoInner(
          this.sharedContext,
          coingeckoAPIBaseURL,
          coingeckoAPIURI,
          coingeckoChainId,
          contractAddress
        );
      }
    });
  }

  getQueryContract(
    contractAddress: string
  ): ObservableQueryCoingeckoTokenInfoInner | undefined {
    return this.get(contractAddress) as ObservableQueryCoingeckoTokenInfoInner;
  }
}

const coingeckoChainIdMap: Record<string, string> = {
  "eip155:1": "ethereum",
  "eip155:10": "optimistic-ethereum",
  "eip155:137": "polygon-pos",
  "eip155:8453": "base",
  "eip155:42161": "arbitrum-one",
};
