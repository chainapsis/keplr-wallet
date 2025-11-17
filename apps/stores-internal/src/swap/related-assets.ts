import {
  HasMapStore,
  IChainInfoImpl,
  IChainStore,
  ObservableQuery,
  QuerySharedContext,
} from "@keplr-wallet/stores";
import { RelatedAssetsRequest, RelatedAssetsResponse } from "./types";
import { computed, makeObservable } from "mobx";
import Joi from "joi";
import { simpleFetch } from "@keplr-wallet/simple-fetch";
import { Currency } from "@keplr-wallet/types";
import { ChainIdHelper } from "@keplr-wallet/cosmos";

const Schema = Joi.object<RelatedAssetsResponse>({
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
}).unknown(true);

export class ObservableQueryRelatedAssetsInner extends ObservableQuery<RelatedAssetsResponse> {
  constructor(
    sharedContext: QuerySharedContext,
    protected readonly chainStore: IChainStore,
    baseURL: string,
    protected readonly chainId: string,
    protected readonly denom: string
  ) {
    super(sharedContext, baseURL, "/v2/swap/swappable_related_assets");

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
        token.type === "evm" ? `eip155:${token.chain_id}` : token.chain_id;
      if (this.chainStore.hasChain(chainId) && token.decimals <= 18) {
        const denom = (() => {
          if (token.type === "evm") {
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
  ): Promise<{ headers: any; data: RelatedAssetsResponse }> {
    const request: RelatedAssetsRequest = {
      chain_id: (() => {
        if (this.chainId.startsWith("eip155:")) {
          return this.chainId.replace("eip155:", "");
        }
        return this.chainId;
      })(),
      denom: (() => {
        const currencies = this.chainStore.getChain(this.chainId).currencies;
        if (this.chainId.startsWith("eip155:") && currencies.length > 0) {
          if (currencies[0].coinMinimalDenom === this.denom) {
            return "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
          }
        }
        if (this.denom.startsWith("erc20:")) {
          return this.denom.replace("erc20:", "");
        }
        return this.denom;
      })(),
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
        "Failed to validate swappable related assets response from source response",
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
      chainId: this.chainId,
      denom: this.denom,
    })}`;
  }
}

export class ObservableQueryRelatedAssets extends HasMapStore<ObservableQueryRelatedAssetsInner> {
  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainStore: IChainStore,
    protected readonly baseURL: string
  ) {
    super((key) => {
      const p = JSON.parse(key);
      return new ObservableQueryRelatedAssetsInner(
        this.sharedContext,
        this.chainStore,
        this.baseURL,
        p.chainId,
        p.denom
      );
    });
  }

  getObservableQueryRelatedAssets(
    chainId: string,
    denom: string
  ): ObservableQueryRelatedAssetsInner {
    return this.get(
      JSON.stringify({
        chainId,
        denom,
      })
    );
  }
}
