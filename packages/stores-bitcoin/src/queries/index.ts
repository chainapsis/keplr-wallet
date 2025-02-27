import { ChainGetter, QuerySharedContext } from "@keplr-wallet/stores";
import { DeepReadonly } from "utility-types";
export class BitcoinQueriesStore {
  protected map: Map<string, BitcoinQueriesStoreImpl> = new Map();

  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainGetter: ChainGetter,
    protected readonly tokenContractListURL: string
  ) {}

  public get(chainId: string): DeepReadonly<BitcoinQueriesStoreImpl> {
    const prior = this.map.get(chainId);
    if (prior) {
      return prior;
    }

    const store = new BitcoinQueriesStoreImpl(
      this.sharedContext,
      chainId,
      this.chainGetter,
      this.tokenContractListURL
    );
    this.map.set(chainId, store);

    return store;
  }
}

class BitcoinQueriesStoreImpl {
  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter,
    protected readonly tokenContractListURL: string
  ) {}
}
