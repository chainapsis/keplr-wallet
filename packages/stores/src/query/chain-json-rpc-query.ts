import { ObservableQuery, QuerySharedContext } from "../common";
import { ChainGetter } from "../chain";
import { HasMapStore } from "../common";

export class ObservableChainQueryJSONRPC<
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
    body: Record<string, any>
  ) {
    const chainInfo = chainGetter.getChain(chainId);

    super(sharedContext, chainInfo.rpc, url, { method: "POST", body });

    this._chainId = chainId;
    this.chainGetter = chainGetter;
  }

  get chainId(): string {
    return this._chainId;
  }
}

export class ObservableChainQueryJSONRPCMap<
  T = unknown,
  E = unknown
> extends HasMapStore<ObservableChainQueryJSONRPC<T, E>> {
  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter,
    creater: (key: string) => ObservableChainQueryJSONRPC<T, E>
  ) {
    super(creater);
  }
}
