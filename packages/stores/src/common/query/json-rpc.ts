import { ObservableQuery, QueryOptions } from "./query";
import { QuerySharedContext } from "./context";
import { action, makeObservable, observable } from "mobx";
import { Hash } from "@keplr-wallet/crypto";
import { Buffer } from "buffer/";
import { HasMapStore } from "../map";
import { simpleFetch } from "@keplr-wallet/simple-fetch";
import { JsonRpcResponse } from "@keplr-wallet/types";

/**
 * Experimental implementation for json rpc.
 */
export class ObservableJsonRPCQuery<
  T = unknown,
  E = unknown
> extends ObservableQuery<T, E> {
  @observable.ref
  protected _params?: readonly unknown[] | Record<string, unknown>;

  constructor(
    sharedContext: QuerySharedContext,
    baseURL: string,
    url: string,
    protected readonly method: string,
    params?: readonly unknown[] | Record<string, unknown>,
    options: Partial<QueryOptions> = {}
  ) {
    super(sharedContext, baseURL, url, options);

    this._params = params;

    makeObservable(this);
  }

  get params(): readonly unknown[] | Record<string, unknown> | undefined {
    return this._params;
  }

  @action
  protected setParams(params?: readonly unknown[] | Record<string, unknown>) {
    this._params = params;
    this.fetch();
  }

  protected override async fetchResponse(
    abortController: AbortController
  ): Promise<{ headers: any; data: T }> {
    const result = await simpleFetch<JsonRpcResponse<T>>(
      this.baseURL,
      this.url,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "1",
          method: this.method,
          params: this.params,
        }),
        signal: abortController.signal,
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
      data: result.data.result,
    };
  }

  protected override getCacheKey(): string {
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
