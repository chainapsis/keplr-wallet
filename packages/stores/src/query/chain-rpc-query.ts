import { ObservableQuery } from "../common";
import { KVStore } from "@keplr-wallet/common";
import { ChainGetter } from "../chain";
import { HasMapStore } from "../common";

export class ObservableChainQueryRPC<
  T = unknown,
  E = unknown
> extends ObservableQuery<T, E> {
  // Chain Id should not be changed after creation.
  protected readonly _chainId: string;
  protected readonly chainGetter: ChainGetter;

  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    url: string
  ) {
    const chainInfo = chainGetter.getChain(chainId);

    super(kvStore, chainInfo.rpc, url);

    this._chainId = chainId;
    this.chainGetter = chainGetter;
  }

  get chainId(): string {
    return this._chainId;
  }
}

export class ObservableChainQueryRPCMap<
  T = unknown,
  E = unknown
> extends HasMapStore<ObservableChainQueryRPC<T, E>> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter,
    creater: (key: string) => ObservableChainQueryRPC<T, E>
  ) {
    super(creater);
  }
}
