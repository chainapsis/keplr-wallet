import { ObservableQuery } from "./base";
import { KVStore } from "../../../../common/kvstore";
import Axios, { AxiosInstance } from "axios";
import { computed } from "mobx";
import { ChainGetter } from "./index";
import { HasMapStore } from "../common/map";

export class ObservableChainQuery<
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

    const instance = Axios.create({
      ...{
        baseURL: chainInfo.rest
      },
      ...chainInfo.restConfig
    });

    super(kvStore, instance, url);

    this._chainId = chainId;
    this.chainGetter = chainGetter;
  }

  @computed
  protected get instance(): AxiosInstance {
    const chainInfo = this.chainGetter.getChain(this.chainId);

    return Axios.create({
      ...{
        baseURL: chainInfo.rest
      },
      ...chainInfo.restConfig
    });
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
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter,
    creater: (key: string) => ObservableChainQuery<T, E>
  ) {
    super(creater);
  }
}
