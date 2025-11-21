import {
  HasMapStore,
  IChainInfoImpl,
  IChainStore,
  ObservableQuery,
  QuerySharedContext,
} from "@keplr-wallet/stores";
import {
  SwapChainType,
  TargetAssetsRequest,
  TargetAssetsResponse,
} from "./types";
import { computed, makeObservable } from "mobx";
import Joi from "joi";
import { simpleFetch } from "@keplr-wallet/simple-fetch";
import { Currency } from "@keplr-wallet/types";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { normalizeChainId, normalizeDenom } from "./utils";

const Schema = Joi.object<TargetAssetsResponse>({
  tokens: Joi.array()
    .items(
      Joi.object({
        token_id: Joi.string().required(),
        type: Joi.string().required(),
        chain_id: Joi.string().required(),
        denom: Joi.string().required(),
        symbol: Joi.string().required(),
        name: Joi.string().required(),
        decimals: Joi.number().required(),
        image_url: Joi.string().allow(null).optional(),
        coingecko_id: Joi.string().allow(null).optional(),
        vendor: Joi.array().items(Joi.string()).required(),
      }).unknown(true)
    )
    .required(),
  pagination: Joi.object({
    page: Joi.number().required(),
    limit: Joi.number().required(),
    total: Joi.number().required(),
    total_pages: Joi.number().required(),
  }).unknown(true),
}).unknown(true);

export class ObservableQueryTargetAssetsInner extends ObservableQuery<TargetAssetsResponse> {
  constructor(
    sharedContext: QuerySharedContext,
    protected readonly chainStore: IChainStore,
    baseURL: string,
    protected readonly chainId: string,
    protected readonly denom: string,
    protected readonly page: number,
    protected readonly limit: number,
    protected readonly search: string
  ) {
    super(sharedContext, baseURL, "/v2/swap/swappable_target_assets", {
      disableCache: page !== 1 || search.trim().length > 0,
    });

    makeObservable(this);
  }

  @computed
  get currencies(): (Currency & {
    chainId: string;
  })[] {
    if (!this.response) {
      return [];
    }

    const res: (Currency & {
      chainId: string;
    })[] = [];

    for (const token of this.response.data.tokens) {
      const chainId =
        token.type === SwapChainType.EVM
          ? `eip155:${token.chain_id}`
          : token.chain_id;
      if (this.chainStore.hasChain(chainId) && token.decimals <= 18) {
        const denom = (() => {
          if (token.type === SwapChainType.EVM) {
            if (token.denom === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") {
              return this.chainStore.getChain(chainId).currencies[0]
                .coinMinimalDenom;
            }
            return `erc20:${token.denom}`;
          } else {
            return token.denom;
          }
        })();
        res.push({
          coinMinimalDenom: denom,
          coinDenom: token.symbol,
          coinDecimals: token.decimals,
          coinGeckoId: token.coingecko_id || undefined,
          coinImageUrl: token.image_url || undefined,
          chainId,
        });
      }
    }

    return res;
  }

  @computed
  get currenciesMap(): Map<
    string,
    {
      chainInfo: IChainInfoImpl;
      currencies: Currency[];
    }
  > {
    const currencies = this.currencies;

    const map = new Map<
      string,
      {
        chainInfo: IChainInfoImpl;
        currencies: Currency[];
      }
    >();
    for (const currency of currencies) {
      const chainId = currency.chainId;
      const chainIdentifier = ChainIdHelper.parse(chainId).identifier;
      if (!map.has(chainIdentifier)) {
        map.set(chainIdentifier, {
          chainInfo: this.chainStore.getChain(chainId),
          currencies: [],
        });
      }

      const arr = map.get(chainIdentifier)!.currencies;
      arr.push(currency);
    }

    return map;
  }

  protected override async fetchResponse(
    abortController: AbortController
  ): Promise<{ headers: any; data: TargetAssetsResponse }> {
    const request: TargetAssetsRequest = {
      chain_id: normalizeChainId(this.chainId),
      denom: normalizeDenom(this.chainStore, this.chainId, this.denom),
      page: this.page,
      limit: this.limit,
    };

    if (this.search.trim().length > 0) {
      request.search = this.search;
    }

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
        "Failed to validate swappable target assets response",
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
      chainId: normalizeChainId(this.chainId),
      denom: normalizeDenom(this.chainStore, this.chainId, this.denom),
      page: this.page,
      limit: this.limit,
      search: this.search.trim(),
    })}`;
  }
}

export class ObservableQueryTargetAssets extends HasMapStore<ObservableQueryTargetAssetsInner> {
  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainStore: IChainStore,
    protected readonly baseURL: string
  ) {
    super((key) => {
      const p = JSON.parse(key);
      return new ObservableQueryTargetAssetsInner(
        this.sharedContext,
        this.chainStore,
        this.baseURL,
        p.chainId,
        p.denom,
        p.page,
        p.limit,
        p.search
      );
    });
  }

  getObservableQueryTargetAssets(
    chainId: string,
    denom: string,
    page: number,
    limit: number,
    search: string
  ): ObservableQueryTargetAssetsInner {
    return this.get(
      JSON.stringify({
        chainId,
        denom,
        page,
        limit,
        search,
      })
    );
  }
}
