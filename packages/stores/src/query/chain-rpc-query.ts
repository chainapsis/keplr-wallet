import { ObservableQuery } from "../common";
import { KVStore } from "@keplr-wallet/common";
import Axios, { AxiosInstance } from "axios";
import { override } from "mobx";
import { ChainGetter } from "../common";
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

    const instance = Axios.create({
      ...{
        baseURL: chainInfo.rpc,
      },
      ...chainInfo.rpcConfig,
    });

    super(kvStore, instance, url);

    this._chainId = chainId;
    this.chainGetter = chainGetter;
  }

  @override
  protected get instance(): AxiosInstance {
    const chainInfo = this.chainGetter.getChain(this.chainId);

    return Axios.create({
      ...{
        baseURL: chainInfo.rpc,
      },
      ...chainInfo.rpcConfig,
    });
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
