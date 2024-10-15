import {
  ChainGetter,
  HasMapStore,
  ObservableJsonRPCQuery,
  QuerySharedContext,
} from "@keplr-wallet/stores";

export class ObservableStarknetChainJsonRpcQuery<
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
    let url = "";
    const modularChainInfo = chainGetter.getModularChain(chainId);
    if ("starknet" in modularChainInfo) {
      url = modularChainInfo.starknet.rpc;
    }

    super(sharedContext, url, "", method, { block_id: "latest", ...params });

    this._chainId = chainId;
    this.chainGetter = chainGetter;
  }

  // TODO: 이 방식을 유지할지 직접 쿼리를 날리지 나중에 결정
  // protected override async fetchResponse(): Promise<{ headers: any; data: T }> {
  //   const keplr = await getKeplrFromWindow();
  //   const data = await keplr?.ethereum.request({
  //     method: this.method,
  //     params: this.params,
  //     chainId: this._chainId,
  //   });
  //
  //   return {
  //     headers: {},
  //     data: data as T,
  //   };
  // }

  get chainId(): string {
    return this._chainId;
  }
}

export class ObservableStarknetChainJsonRpcQueryMap<
  T = unknown,
  E = unknown
> extends HasMapStore<ObservableStarknetChainJsonRpcQuery<T, E>> {
  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter,
    creater: (key: string) => ObservableStarknetChainJsonRpcQuery<T, E>
  ) {
    super(creater);
  }
}
