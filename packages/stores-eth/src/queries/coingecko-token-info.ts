import {
  ChainGetter,
  HasMapStore,
  ObservableQuery,
  QuerySharedContext,
} from "@keplr-wallet/stores";
import { makeObservable } from "mobx";
export class ObservableQueryCoingeckoTokenInfoInner extends ObservableQuery<{
  networkId: string;
  contractAddress: string;
  id: string;
  type: string;
  name: string;
  symbol: string;
  image_url: string;
  coingecko_coin_id: string;
  decimals: number;
  timestamp: string;
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
    return this.response?.data?.symbol;
  }

  get decimals(): number | undefined {
    return this.response?.data?.decimals;
  }

  get coingeckoId(): string | undefined {
    return this.response?.data?.coingecko_coin_id;
  }

  get logoURI(): string | undefined {
    return this.response?.data?.image_url;
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
  "eip155:1": "eth",
  "eip155:10": "optimism",
  "eip155:137": "polygon_pos",
  "eip155:8453": "base",
  "eip155:42161": "arbitrum",
  "eip155:56": "bsc",
  "eip155:43114": "avax",
};
