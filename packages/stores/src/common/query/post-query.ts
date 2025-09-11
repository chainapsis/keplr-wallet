import { ObservableQuery, QueryOptions } from "./query";
import { QuerySharedContext } from "./context";
import { makeObservable, observable } from "mobx";
import { Hash } from "@keplr-wallet/crypto";
import { Buffer } from "buffer/";
import { HasMapStore } from "../map";
import { simpleFetch } from "@keplr-wallet/simple-fetch";

export interface PostRequestOptions {
  headers?: Record<string, string>;
  contentType?:
    | "application/json"
    | "application/x-www-form-urlencoded"
    | "text/plain"
    | string;
  timeout?: number;
}

/**
 * ObservableQuery extension that supports POST requests
 */
export class ObservablePostQuery<
  T = unknown,
  E = unknown,
  Body = unknown
> extends ObservableQuery<T, E> {
  @observable
  protected _body?: Body;

  @observable
  protected _postOptions: PostRequestOptions;

  constructor(
    sharedContext: QuerySharedContext,
    baseURL: string,
    url: string,
    body: Body | undefined = undefined,
    postOptions: PostRequestOptions = {},
    options: Partial<QueryOptions> = {}
  ) {
    super(sharedContext, baseURL, url, options);

    this._body = body;
    this._postOptions = {
      contentType: "application/json",
      ...postOptions,
    };

    makeObservable(this);
  }

  protected override async fetchResponse(
    abortController: AbortController
  ): Promise<{ headers: any; data: T }> {
    const headers: Record<string, string> = {
      "content-type": this._postOptions.contentType || "application/json",
      ...this._postOptions.headers,
    };

    let body: string | undefined;
    if (this._body !== undefined) {
      if (this._postOptions.contentType === "application/json") {
        body = JSON.stringify(this._body);
      } else if (typeof this._body === "string") {
        body = this._body;
      } else {
        body = String(this._body);
      }
    }

    const result = await simpleFetch<T>(this.baseURL, this.url, {
      method: "POST",
      headers,
      body,
      signal: abortController.signal,
    });

    return {
      headers: result.headers,
      data: result.data,
    };
  }

  protected override getCacheKey(): string {
    const baseKey = super.getCacheKey();
    if (this._body) {
      const bodyHash = Buffer.from(
        Hash.sha256(Buffer.from(JSON.stringify(this._body))).slice(0, 8)
      ).toString("hex");
      return `${baseKey}-post-${bodyHash}`;
    }
    return `${baseKey}-post`;
  }
}

export class ObservablePostQueryMap<
  T = unknown,
  E = unknown,
  Body = unknown
> extends HasMapStore<ObservablePostQuery<T, E, Body>> {
  constructor(creater: (key: string) => ObservablePostQuery<T, E, Body>) {
    super(creater);
  }
}
