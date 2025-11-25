import {
  HasMapStore,
  IChainStore,
  ObservableQuery,
  QuerySharedContext,
} from "@keplr-wallet/stores";
import {
  ValidateTargetAssetsRequest,
  ValidateTargetAssetsResponse,
} from "./types";
import {
  computed,
  makeObservable,
  observable,
  ObservableMap,
  runInAction,
} from "mobx";
import Joi from "joi";
import { simpleFetch } from "@keplr-wallet/simple-fetch";
import chunk from "lodash.chunk";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { normalizeChainId, normalizeDenom } from "./utils";

const Schema = Joi.object<ValidateTargetAssetsResponse>({
  tokens: Joi.array()
    .items(
      Joi.object({
        chain_id: Joi.string().required(),
        denom: Joi.string().required(),
      }).unknown(true)
    )
    .required(),
}).unknown(true);

export class ObservableQueryValidateTargetAssetsInner extends ObservableQuery<ValidateTargetAssetsResponse> {
  constructor(
    sharedContext: QuerySharedContext,
    protected readonly chainStore: IChainStore,
    baseURL: string,
    protected readonly chainId: string,
    protected readonly denom: string,
    protected readonly tokens: {
      chainId: string;
      denom: string;
    }[]
  ) {
    super(sharedContext, baseURL, "/v2/swap/validate_target_assets");

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

  isTargetAssetsToken(chainId: string, denom: string): boolean {
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
  ): Promise<{ headers: any; data: ValidateTargetAssetsResponse }> {
    const request: ValidateTargetAssetsRequest = {
      chain_id: normalizeChainId(this.chainId),
      denom: normalizeDenom(this.chainStore, this.chainId, this.denom),
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
      console.error(
        "Failed to validate validate target assets response",
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
      chain_id: normalizeChainId(this.chainId),
      denom: normalizeDenom(this.chainStore, this.chainId, this.denom),
      tokens: this.tokens.map((t) => {
        return {
          chain_id: normalizeChainId(t.chainId),
          denom: normalizeDenom(this.chainStore, t.chainId, t.denom),
        };
      }),
    })}`;
  }
}

export class ObservableQueryValidateTargetAssets extends HasMapStore<ObservableQueryValidateTargetAssetsInner> {
  protected batchTokenToKey: Map<string, ObservableMap<string, string>> =
    new Map();

  protected batchTick: Map<string, Promise<void> | undefined> = new Map();
  protected batchTokens: Map<
    string,
    Map<string, { chainId: string; denom: string }>
  > = new Map();

  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainStore: IChainStore,
    protected readonly baseURL: string
  ) {
    super((key) => {
      const obj = JSON.parse(key);
      return new ObservableQueryValidateTargetAssetsInner(
        this.sharedContext,
        this.chainStore,
        this.baseURL,
        obj.chainId,
        obj.denom,
        obj.tokens
      );
    });
  }

  protected getBatchState(baseKey: string): {
    batchTokenToKey: Map<string, string>;
    batchTokens: Map<string, { chainId: string; denom: string }>;
  } {
    let batchTokenToKey: ObservableMap<string, string>;
    let batchTokens: Map<string, { chainId: string; denom: string }>;
    if (!this.batchTokenToKey.has(baseKey)) {
      batchTokenToKey = observable.map();
      this.batchTokenToKey.set(baseKey, batchTokenToKey);
    } else {
      batchTokenToKey = this.batchTokenToKey.get(baseKey)!;
    }
    if (!this.batchTokens.has(baseKey)) {
      batchTokens = new Map();
      this.batchTokens.set(baseKey, batchTokens);
    } else {
      batchTokens = this.batchTokens.get(baseKey)!;
    }

    return {
      batchTokenToKey,
      batchTokens,
    };
  }

  isTargetAssetsToken(
    chainId: string,
    denom: string,
    token: {
      chainId: string;
      denom: string;
    }
  ): boolean {
    const observable = this.getObservableQueryValidateTargetAssets(
      chainId,
      denom,
      token
    );
    if (observable) {
      return observable.isTargetAssetsToken(token.chainId, token.denom);
    }
    return false;
  }

  getObservableQueryValidateTargetAssets(
    chainId: string,
    denom: string,
    token: {
      chainId: string;
      denom: string;
    }
  ): ObservableQueryValidateTargetAssetsInner | undefined {
    const baseKey = `${
      ChainIdHelper.parse(chainId).identifier
    }/${normalizeDenom(this.chainStore, chainId, denom)}`;

    const { batchTokenToKey, batchTokens } = this.getBatchState(baseKey);

    const key = `${
      ChainIdHelper.parse(token.chainId).identifier
    }/${normalizeDenom(this.chainStore, token.chainId, token.denom)}`;
    if (batchTokenToKey.has(key)) {
      const k = batchTokenToKey.get(key);
      return this.get(k!);
    }

    if (!batchTokens.has(key)) {
      batchTokens.set(key, {
        chainId: token.chainId,
        denom: token.denom,
      });
    }
    if (!this.batchTick.get(baseKey)) {
      this.batchTick.set(baseKey, Promise.resolve());
      this.batchTick.get(baseKey)!.then(() => {
        this.batchTick.set(baseKey, undefined);
        const tokens = Array.from(batchTokens.values());
        batchTokens.clear();

        if (tokens.length > 0) {
          const chunks = chunk(tokens, 100);

          for (const tokens of chunks) {
            const k = JSON.stringify({
              chainId,
              denom,
              tokens,
            });

            // Get invokes the creationg of ObservableQueryValidateTargetAssetsInner
            this.get(k);

            runInAction(() => {
              for (const t of tokens) {
                batchTokenToKey.set(
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

    if (batchTokenToKey.has(key)) {
      const k = batchTokenToKey.get(key);
      return this.get(k!);
    }
  }
}
