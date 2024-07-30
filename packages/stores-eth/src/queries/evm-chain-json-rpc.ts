import {
  ChainGetter,
  getKeplrFromWindow,
  HasMapStore,
  ObservableJsonRPCQuery,
  QuerySharedContext,
} from "@keplr-wallet/stores";

export class ObservableEvmChainJsonRpcQuery<
  T = unknown,
  E = unknown
> extends ObservableJsonRPCQuery<T, E> {
  // Chain Id should not be changed after creation.
  protected readonly _chainId: string;
  protected readonly chainGetter: ChainGetter;

  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    method: string,
    params?: unknown[] | Record<string, unknown>
  ) {
    const chainInfo = chainGetter.getChain(chainId);

    super(sharedContext, chainInfo.evm?.rpc ?? "", "", method, params);

    this._chainId = chainId;
    this.chainGetter = chainGetter;
  }

  protected override async fetchResponse(): Promise<{ headers: any; data: T }> {
    const keplr = await getKeplrFromWindow();
    const data = await keplr?.ethereum.request({
      method: this.method,
      params: this.params,
      chainId: this._chainId,
    });

    return {
      headers: {},
      data: data as T,
    };
  }

  get chainId(): string {
    return this._chainId;
  }
}

export class ObservableEvmChainJsonRpcQueryMap<
  T = unknown,
  E = unknown
> extends HasMapStore<ObservableEvmChainJsonRpcQuery<T, E>> {
  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter,
    creater: (key: string) => ObservableEvmChainJsonRpcQuery<T, E>
  ) {
    super(creater);
  }
}
