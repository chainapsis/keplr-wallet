import {
  HasMapStore,
  ObservableQuery,
  QuerySharedContext,
} from "@keplr-wallet/stores";
import { AssetsResponse } from "./types";
import { computed, makeObservable } from "mobx";
import Joi from "joi";
import { InternalChainStore } from "../internal";
import { SwapUsageQueries } from "../swap-usage";
import { simpleFetch } from "@keplr-wallet/simple-fetch";

const Schema = Joi.object<AssetsResponse>({
  chain_to_assets_map: Joi.object().pattern(
    Joi.string(),
    Joi.object({
      assets: Joi.array().items(
        Joi.object({
          denom: Joi.string().required(),
          chain_id: Joi.string().required(),
          origin_denom: Joi.string().required(),
          origin_chain_id: Joi.string().required(),
          is_evm: Joi.boolean().required(),
          token_contract: Joi.string().optional(),
          recommended_symbol: Joi.string().optional(),
          decimals: Joi.number().required(),
          logo_uri: Joi.string().optional(),
          coingecko_id: Joi.string().optional(),
        }).unknown(true)
      ),
    }).unknown(true)
  ),
}).unknown(true);

export class ObservableQueryAssetsInner extends ObservableQuery<AssetsResponse> {
  constructor(
    sharedContext: QuerySharedContext,
    protected readonly chainStore: InternalChainStore,
    protected readonly swapUsageQueries: SwapUsageQueries,
    skipURL: string,
    public readonly chainId: string
  ) {
    super(
      sharedContext,
      skipURL,
      `/v2/fungible/assets?chain_id=${chainId.replace(
        "eip155:",
        ""
      )}&native_only=false&include_evm_assets=true`
    );

    makeObservable(this);
  }

  @computed
  get assetsRaw(): {
    denom: string;
    chainId: string;
    originDenom: string;
    originChainId: string;
    isEvm: boolean;
    tokenContract?: string;
    recommendedSymbol?: string;
    logoURI?: string;
    coingeckoId?: string;
    decimals: number;
  }[] {
    if (
      !this.response ||
      !this.response.data ||
      !this.response.data.chain_to_assets_map
    ) {
      return [];
    }

    if (!this.chainStore.hasChain(this.chainId)) {
      return [];
    }

    const chainInfo = this.chainStore.getChain(this.chainId);
    if (!this.chainStore.isInChainInfosInListUI(chainInfo.chainId)) {
      return [];
    }

    const assetsInResponse =
      this.response.data.chain_to_assets_map[
        this.chainId.replace("eip155:", "")
      ];
    if (assetsInResponse) {
      const res: {
        denom: string;
        chainId: string;
        originDenom: string;
        originChainId: string;
        isEvm: boolean;
        tokenContract?: string;
        recommendedSymbol?: string;
        logoURI?: string;
        coingeckoId?: string;
        decimals: number;
      }[] = [];

      for (const asset of assetsInResponse.assets) {
        const chainId = !Number.isNaN(parseInt(asset.chain_id))
          ? `eip155:${asset.chain_id}`
          : asset.chain_id;
        const originChainId = !Number.isNaN(parseInt(asset.origin_chain_id))
          ? `eip155:${asset.origin_chain_id}`
          : asset.origin_chain_id;
        if (
          this.chainStore.hasChain(chainId) &&
          (this.chainStore.hasChain(originChainId) ||
            (asset.chain_id === "osmosis-1" &&
              asset.denom ===
                "ibc/0FA9232B262B89E77D1335D54FB1E1F506A92A7E4B51524B400DC69C68D28372"))
        ) {
          // IBC asset일 경우 그냥 넣는다.
          if (asset.denom.startsWith("ibc/")) {
            res.push({
              denom: asset.denom,
              chainId: chainId,
              originDenom: asset.origin_denom,
              originChainId: originChainId,
              isEvm: false,
              recommendedSymbol: asset.recommended_symbol,
              logoURI: asset.logo_uri,
              coingeckoId: asset.coingecko_id,
              decimals: asset.decimals,
            });
          } else {
            const coinMinimalDenom =
              asset.is_evm &&
              asset.token_contract != null &&
              asset.token_contract.startsWith("0x")
                ? `erc20:${asset.token_contract.toLowerCase()}`
                : asset.denom;
            const originCoinMinimalDenom = asset.origin_denom.startsWith("0x")
              ? `erc20:${asset.origin_denom.toLowerCase()}`
              : asset.origin_denom;
            // TODO: Dec, Int 같은 곳에서 18 이상인 경우도 고려하도록 수정
            if (asset.decimals <= 18) {
              res.push({
                denom: coinMinimalDenom,
                chainId: chainId,
                originDenom: originCoinMinimalDenom,
                originChainId: originChainId,
                isEvm: asset.is_evm,
                tokenContract: asset.token_contract,
                recommendedSymbol: asset.recommended_symbol,
                logoURI: asset.logo_uri,
                coingeckoId: asset.coingecko_id,
                decimals: asset.decimals,
              });
            }
          }
        }
      }

      return res;
    }

    return [];
  }

  @computed
  get assets(): {
    denom: string;
    chainId: string;
    originDenom: string;
    originChainId: string;
    isEvm: boolean;
    tokenContract?: string;
    recommendedSymbol?: string;
    logoURI?: string;
    coingeckoId?: string;
    decimals: number;
  }[] {
    if (
      !this.response ||
      !this.response.data ||
      !this.response.data.chain_to_assets_map
    ) {
      return [];
    }

    if (!this.chainStore.hasChain(this.chainId)) {
      return [];
    }

    const chainInfo = this.chainStore.getChain(this.chainId);
    if (!this.chainStore.isInChainInfosInListUI(chainInfo.chainId)) {
      return [];
    }

    const assetsInResponse =
      this.response.data.chain_to_assets_map[
        this.chainId.replace("eip155:", "")
      ];
    if (assetsInResponse) {
      const res: {
        denom: string;
        chainId: string;
        originDenom: string;
        originChainId: string;
        isEvm: boolean;
        tokenContract?: string;
        recommendedSymbol?: string;
        logoURI?: string;
        coingeckoId?: string;
        decimals: number;
      }[] = [];

      for (const asset of assetsInResponse.assets) {
        const chainId = !Number.isNaN(parseInt(asset.chain_id))
          ? `eip155:${asset.chain_id}`
          : asset.chain_id;
        const originChainId = !Number.isNaN(parseInt(asset.origin_chain_id))
          ? `eip155:${asset.origin_chain_id}`
          : asset.origin_chain_id;
        if (
          this.chainStore.hasChain(chainId) &&
          this.chainStore.hasChain(originChainId)
        ) {
          // IBC asset일 경우 그냥 넣는다.
          if (asset.denom.startsWith("ibc/")) {
            res.push({
              denom: asset.denom,
              chainId: chainId,
              originDenom: asset.origin_denom,
              originChainId: originChainId,
              isEvm: false,
              recommendedSymbol: asset.recommended_symbol,
              logoURI: asset.logo_uri,
              coingeckoId: asset.coingecko_id,
              decimals: asset.decimals,
            });
            // IBC asset이 아니라면 알고있는 currency만 넣는다.
          } else {
            const coinMinimalDenom =
              asset.is_evm &&
              asset.token_contract != null &&
              asset.token_contract.startsWith("0x")
                ? `erc20:${asset.token_contract.toLowerCase()}`
                : asset.denom;
            const originCoinMinimalDenom = asset.origin_denom.startsWith("0x")
              ? `erc20:${asset.origin_denom.toLowerCase()}`
              : asset.origin_denom;
            const currencyFound =
              chainInfo.findCurrencyWithoutReaction(coinMinimalDenom);
            // decimals이 18 이하인 경우만을 고려해서 짜여진 코드가 많아서 임시로 18 이하인 경우만 고려한다.
            // TODO: Dec, Int 같은 곳에서 18 이상인 경우도 고려하도록 수정
            if (currencyFound && currencyFound.coinDecimals <= 18) {
              res.push({
                denom: coinMinimalDenom,
                chainId: chainId,
                originDenom: originCoinMinimalDenom,
                originChainId: originChainId,
                isEvm: asset.is_evm,
                tokenContract: asset.token_contract,
                recommendedSymbol: asset.recommended_symbol,
                logoURI: asset.logo_uri,
                coingeckoId: asset.coingecko_id,
                decimals: asset.decimals,
              });
            }
          }
        }
      }

      return res;
    }

    return [];
  }

  @computed
  get assetsOnlySwapUsages(): {
    denom: string;
    chainId: string;
    originDenom: string;
    originChainId: string;
  }[] {
    if (
      !this.response ||
      !this.response.data ||
      !this.response.data.chain_to_assets_map
    ) {
      return [];
    }

    if (!this.chainStore.hasChain(this.chainId)) {
      return [];
    }

    const chainInfo = this.chainStore.getChain(this.chainId);
    if (!this.chainStore.isInChainInfosInListUI(chainInfo.chainId)) {
      return [];
    }

    const assetsInResponse =
      this.response.data.chain_to_assets_map[chainInfo.chainId];
    if (assetsInResponse) {
      const res: {
        denom: string;
        chainId: string;
        originDenom: string;
        originChainId: string;
      }[] = [];

      for (const asset of assetsInResponse.assets) {
        if (
          this.chainStore.hasChain(asset.chain_id) &&
          this.chainStore.hasChain(asset.origin_chain_id)
        ) {
          if (
            !this.swapUsageQueries.querySwapUsage
              .getSwapUsage(this.chainId)
              .isSwappable(asset.denom)
          ) {
            continue;
          }

          // IBC asset일 경우 그냥 넣는다.
          if (asset.denom.startsWith("ibc/")) {
            res.push({
              denom: asset.denom,
              chainId: asset.chain_id,
              originDenom: asset.origin_denom,
              originChainId: asset.origin_chain_id,
            });
            // IBC asset이 아니라면 알고있는 currency만 넣는다.
          } else if (chainInfo.findCurrencyWithoutReaction(asset.denom)) {
            res.push({
              denom: asset.denom,
              chainId: asset.chain_id,
              originDenom: asset.origin_denom,
              originChainId: asset.origin_chain_id,
            });
          }
        }
      }

      return res;
    }

    return [];
  }

  protected override async fetchResponse(
    abortController: AbortController
  ): Promise<{ headers: any; data: AssetsResponse }> {
    const _result = await simpleFetch(this.baseURL, this.url, {
      signal: abortController.signal,
      headers: {
        ...(() => {
          const res: { authorization?: string } = {};
          if (process.env["SKIP_API_KEY"]) {
            res.authorization = process.env["SKIP_API_KEY"];
          }

          return res;
        })(),
      },
    });
    const result = {
      headers: _result.headers,
      data: _result.data,
    };

    const validated = Schema.validate(result.data);
    if (validated.error) {
      console.log(
        "Failed to validate assets from source response",
        validated.error
      );
      throw validated.error;
    }

    return {
      headers: result.headers,
      data: validated.value,
    };
  }
}

export class ObservableQueryAssets extends HasMapStore<ObservableQueryAssetsInner> {
  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainStore: InternalChainStore,
    protected readonly swapUsageQueries: SwapUsageQueries,
    protected readonly skipURL: string
  ) {
    super((chainId) => {
      return new ObservableQueryAssetsInner(
        this.sharedContext,
        this.chainStore,
        this.swapUsageQueries,
        this.skipURL,
        chainId
      );
    });
  }

  getAssets(chainId: string): ObservableQueryAssetsInner {
    return this.get(chainId);
  }
}
