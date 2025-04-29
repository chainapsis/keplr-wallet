import { ObservableQuery, QuerySharedContext } from "@keplr-wallet/stores";

export class ObservableQueryTokenContracts extends ObservableQuery<
  TokenContract[]
> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    tokenContractListURL: string
  ) {
    super(sharedContext, tokenContractListURL, `/tokens/${chainId}`);
  }

  get tokenContracts(): TokenContract[] {
    if (!this.response || !this.response.data) {
      return [];
    }

    return this.response.data;
  }
}

export interface TokenContract {
  contractAddress: string;
  imageUrl?: string;
  metadata: {
    name: string;
    symbol: string;
    decimals: number;
  };
  coinGeckoId?: string;
}
