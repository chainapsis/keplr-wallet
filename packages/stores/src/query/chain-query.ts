import { ObservableQuery, QuerySharedContext } from "../common";
import { ChainGetter } from "../chain";
import { HasMapStore } from "../common";

export class ObservableChainQuery<
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
    url: string
  ) {
    const chainInfo = chainGetter.getChain(chainId);

    super(sharedContext, chainInfo.rest, url);

    this._chainId = chainId;
    this.chainGetter = chainGetter;
  }

  get chainId(): string {
    return this._chainId;
  }
}

export class ObservableChainQueryMap<
  T = unknown,
  E = unknown
> extends HasMapStore<ObservableChainQuery<T, E>> {
  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter,
    creator: (key: string) => ObservableChainQuery<T, E>
  ) {
    super(creator);
  }
}
