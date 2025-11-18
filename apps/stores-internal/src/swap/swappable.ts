import {
  HasMapStore,
  IChainStore,
  ObservableQuery,
  QuerySharedContext,
} from "@keplr-wallet/stores";
import { SwappableRequest, SwappableResponse } from "./types";
import { computed, makeObservable, observable, runInAction } from "mobx";
import Joi from "joi";
import { simpleFetch } from "@keplr-wallet/simple-fetch";
import chunk from "lodash.chunk";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { normalizeChainId, normalizeDenom } from "./utils";

const Schema = Joi.object<SwappableResponse>({
  tokens: Joi.array()
    .items(
      Joi.object({
        chain_id: Joi.string().required(),
        denom: Joi.string().required(),
      }).unknown(true)
    )
    .required(),
}).unknown(true);

export class ObservableQuerySwappableInner extends ObservableQuery<SwappableResponse> {
  constructor(
    sharedContext: QuerySharedContext,
    protected readonly chainStore: IChainStore,
    baseURL: string,
    protected readonly tokens: {
      chainId: string;
      denom: string;
    }[]
  ) {
    super(sharedContext, baseURL, "/v2/swap/swappable");

    makeObservable(this);
  }

  @computed
  protected get map(): Map<string, boolean> {
    const res = new Map<string, boolean>();

    if (this.response) {
      for (const t of this.response.data.tokens) {
        res.set(this.makeMapKey(t.chain_id, t.denom), true);
      }
    }

    return res;
  }

  isSwappableToken(chainId: string, denom: string): boolean {
    const key = this.makeMapKey(chainId, denom);
    return this.map.get(key) === true;
  }

  protected makeMapKey(chainId: string, denom: string) {
    return `${normalizeChainId(chainId)}/${normalizeDenom(
      this.chainStore,
      chainId,
      denom
    )}`;
  }

  protected override async fetchResponse(
    abortController: AbortController
  ): Promise<{ headers: any; data: SwappableResponse }> {
    const request: SwappableRequest = {
      tokens: this.tokens.map((t) => {
        return {
          chain_id: normalizeChainId(t.chainId),
          denom: normalizeDenom(this.chainStore, t.chainId, t.denom),
        };
      }),
    };

    const _result = await simpleFetch(this.baseURL, this.url, {
      signal: abortController.signal,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
    const result = {
      headers: _result.headers,
      data: _result.data,
    };

    const validated = Schema.validate(result.data);
    if (validated.error) {
      console.log(
        "Failed to validate swappable response from source response",
        validated.error
      );
      throw validated.error;
    }

    return {
      headers: result.headers,
      data: validated.value,
    };
  }

  protected override getCacheKey(): string {
    return `${super.getCacheKey()}-${JSON.stringify({
      tokens: this.tokens.map((t) => {
        return {
          chain_id: normalizeChainId(t.chainId),
          denom: normalizeDenom(this.chainStore, t.chainId, t.denom),
        };
      }),
    })}`;
  }
}

export class ObservableQuerySwappable extends HasMapStore<ObservableQuerySwappableInner> {
  @observable
  protected batchTokenToKey: Map<string, string> = new Map();

  protected batchTick: Promise<void> | undefined;
  protected batchTokens: Map<string, { chainId: string; denom: string }> =
    new Map();

  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainStore: IChainStore,
    protected readonly baseURL: string
  ) {
    super((key) => {
      const tokens = JSON.parse(key);
      return new ObservableQuerySwappableInner(
        this.sharedContext,
        this.chainStore,
        this.baseURL,
        tokens
      );
    });

    makeObservable(this);
  }

  isSwappableToken(chainId: string, denom: string): boolean {
    const observable = this.getObservableQuerySwappable(chainId, denom);
    if (observable) {
      return observable.isSwappableToken(chainId, denom);
    }
    return false;
  }

  getObservableQuerySwappable(
    chainId: string,
    denom: string
  ): ObservableQuerySwappableInner | undefined {
    const key = `${ChainIdHelper.parse(chainId).identifier}/${normalizeDenom(
      this.chainStore,
      chainId,
      denom
    )}`;
    if (this.batchTokenToKey.has(key)) {
      const k = this.batchTokenToKey.get(key);
      return this.get(k!);
    }

    if (!this.batchTokens.has(key)) {
      this.batchTokens.set(key, {
        chainId,
        denom,
      });
    }
    if (!this.batchTick) {
      this.batchTick = Promise.resolve();
      this.batchTick.then(() => {
        this.batchTick = undefined;
        const tokens = Array.from(this.batchTokens.values());
        this.batchTokens.clear();

        if (tokens.length > 0) {
          const chunks = chunk(tokens, 100);

          for (const tokens of chunks) {
            const k = JSON.stringify(tokens);

            // Get invokes the creationg of ObservableQuerySwappableInner
            this.get(k);

            runInAction(() => {
              for (const t of tokens) {
                this.batchTokenToKey.set(
                  `${
                    ChainIdHelper.parse(t.chainId).identifier
                  }/${normalizeDenom(this.chainStore, t.chainId, t.denom)}`,
                  k
                );
              }
            });
          }
        }
      });
    }

    if (this.batchTokenToKey.has(key)) {
      const k = this.batchTokenToKey.get(key);
      return this.get(k!);
    }
  }
}
