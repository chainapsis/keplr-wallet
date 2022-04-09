import { ObservableQuery, QueryOptions, QueryResponse } from "./index";
import { KVStore } from "@keplr-wallet/common";
import { AxiosInstance, CancelToken } from "axios";
import { action, makeObservable, observable } from "mobx";
import { Hash } from "@keplr-wallet/crypto";
import { Buffer } from "buffer/";
import { HasMapStore } from "../map";

/**
 * Experimental implementation for json rpc.
 */
export class ObservableJsonRPCQuery<
  T = unknown,
  E = unknown
> extends ObservableQuery<T, E> {
  @observable.ref
  protected _params: readonly any[];

  constructor(
    kvStore: KVStore,
    instance: AxiosInstance,
    url: string,
    protected readonly method: string,
    params: readonly any[],
    options: Partial<QueryOptions> = {}
  ) {
    super(kvStore, instance, url, options);

    this._params = params;

    makeObservable(this);
  }

  get params(): readonly any[] {
    return this._params;
  }

  @action
  protected setParams(params: readonly any[]) {
    this._params = params;
    this.fetch();
  }

  protected async fetchResponse(
    cancelToken: CancelToken
  ): Promise<{ response: QueryResponse<T>; headers: any }> {
    const result = await this.instance.post<{
      jsonrpc: "2.0";
      result?: T;
      id: string;
      error?: {
        code?: number;
        message?: string;
      };
    }>(
      this.url,
      {
        jsonrpc: "2.0",
        id: "1",
        method: this.method,
        params: this.params,
      },
      {
        cancelToken,
      }
    );

    if (result.data.error && result.data.error.message) {
      throw new Error(result.data.error.message);
    }

    if (!result.data.result) {
      throw new Error("Unknown error");
    }

    return {
      headers: result.headers,
      response: {
        data: result.data.result,
        status: result.status,
        staled: false,
        timestamp: Date.now(),
      },
    };
  }

  protected getCacheKey(): string {
    const paramsHash = Buffer.from(
      Hash.sha256(Buffer.from(JSON.stringify(this.params))).slice(0, 8)
    ).toString("hex");

    return `${super.getCacheKey()}-${this.method}-${paramsHash}`;
  }
}

export class ObservableJsonRPCQueryMap<
  T = unknown,
  E = unknown
> extends HasMapStore<ObservableJsonRPCQuery<T, E>> {
  constructor(creater: (key: string) => ObservableJsonRPCQuery<T, E>) {
    super(creater);
  }
}
