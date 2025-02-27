import {
  ChainGetter,
  ObservableQuery,
  QueryOptions,
  QuerySharedContext,
} from "@keplr-wallet/stores";
import { GenesisHash } from "@keplr-wallet/types";

export class ObservableBitcoinIndexerQuery<
  T = unknown,
  E = unknown
> extends ObservableQuery<T, E> {
  // Chain Id should not be changed after creation.
  protected readonly _chainId: string;
  protected readonly chainGetter: ChainGetter;

  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    url: string,
    options?: Partial<QueryOptions>
  ) {
    let baseUrl = "";
    const modularChainInfo = chainGetter.getModularChain(chainId);
    if ("bitcoin" in modularChainInfo) {
      baseUrl = modularChainInfo.bitcoin.rest;
    }

    super(sharedContext, baseUrl, url, options);

    this._chainId = chainId;
    this.chainGetter = chainGetter;
  }

  protected override canFetch(): boolean {
    // TODO: enable for mainnet once indexer setup is done
    if (this._chainId.startsWith(`bip122:${GenesisHash.MAINNET}`)) {
      return false;
    }

    return super.canFetch();
  }

  get chainId(): string {
    return this._chainId;
  }
}
