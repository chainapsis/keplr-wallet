import {
  HasMapStore,
  ObservableQuery,
  QueryOptions,
  QuerySharedContext,
} from "@keplr-wallet/stores";
import { AssetsResponse } from "./types";
import { computed, makeObservable, observable, runInAction } from "mobx";
import Joi from "joi";
import { InternalChainStore } from "../internal";
import { SwapUsageQueries } from "../swap-usage";
import { simpleFetch } from "@keplr-wallet/simple-fetch";
import { computedFn } from "mobx-utils";

export interface Asset {
  denom: string;
  chainId: string;
  originDenom: string;
  originChainId: string;
  isEvm: boolean;
  isCw20: boolean;
  isSvm: boolean;
  trace: string;
  tokenContract?: string;
  recommendedSymbol?: string;
  symbol: string;
  logoURI?: string;
  coingeckoId?: string;
  decimals: number;
}

export interface SwapAsset {
  denom: string;
  chainId: string;
  originDenom: string;
  originChainId: string;
}

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
          decimals: Joi.number().optional(),
          logo_uri: Joi.string().optional(),
          coingecko_id: Joi.string().optional(),
          is_cw20: Joi.boolean().optional(),
          is_svm: Joi.boolean().optional(),
          trace: Joi.string().optional().allow(""),
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
    super(sharedContext, skipURL, `/v1/swap/assets?chainId=${chainId}`);

    makeObservable(this);
  }

  @computed
  get assetsRaw(): Asset[] {
    if (
      !this.response ||
      !this.response.data ||
      !this.response.data.chain_to_assets_map
    ) {
      return [];
    }

    if (!this.isSwappableChain(this.chainId)) {
      return [];
    }

    const chainInfo = this.chainStore.getModularChain(this.chainId);
    if (!this.chainStore.isInModularChainInfosInListUI(chainInfo.chainId)) {
      return [];
    }

    const assetsInResponse =
      this.response.data.chain_to_assets_map[
        this.chainId.replace("eip155:", "")
      ];
    if (assetsInResponse) {
      const res: Asset[] = [];

      for (const asset of assetsInResponse.assets) {
        const chainId = !Number.isNaN(parseInt(asset.chain_id))
          ? `eip155:${asset.chain_id}`
          : asset.chain_id;
        const originChainId = !Number.isNaN(parseInt(asset.origin_chain_id))
          ? `eip155:${asset.origin_chain_id}`
          : asset.origin_chain_id;
        if (
          this.isSwappableChain(chainId) &&
          (this.isSwappableChain(originChainId) ||
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
              symbol: asset.symbol,
              logoURI: asset.logo_uri,
              coingeckoId: asset.coingecko_id,
              decimals: asset.decimals ?? 0,
              isCw20: asset.is_cw20,
              isSvm: asset.is_svm,
              trace: asset.trace,
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
            if (asset.decimals != null && asset.decimals <= 18) {
              res.push({
                denom: coinMinimalDenom,
                chainId: chainId,
                originDenom: originCoinMinimalDenom,
                originChainId: originChainId,
                isEvm: asset.is_evm,
                tokenContract: asset.token_contract,
                recommendedSymbol: asset.recommended_symbol,
                symbol: asset.symbol,
                logoURI: asset.logo_uri,
                coingeckoId: asset.coingecko_id,
                decimals: asset.decimals,
                isCw20: asset.is_cw20,
                isSvm: asset.is_svm,
                trace: asset.trace,
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
  get assets(): Asset[] {
    if (
      !this.response ||
      !this.response.data ||
      !this.response.data.chain_to_assets_map
    ) {
      return [];
    }

    if (!this.isSwappableChain(this.chainId)) {
      return [];
    }

    const chainInfo = this.chainStore.getModularChain(this.chainId);
    if (!this.chainStore.isInModularChainInfosInListUI(chainInfo.chainId)) {
      return [];
    }

    const assetsInResponse =
      this.response.data.chain_to_assets_map[
        this.chainId.replace("eip155:", "")
      ];
    if (assetsInResponse) {
      const res: Asset[] = [];

      for (const asset of assetsInResponse.assets) {
        const chainId = !Number.isNaN(parseInt(asset.chain_id))
          ? `eip155:${asset.chain_id}`
          : asset.chain_id;
        const originChainId = !Number.isNaN(parseInt(asset.origin_chain_id))
          ? `eip155:${asset.origin_chain_id}`
          : asset.origin_chain_id;
        if (
          this.isSwappableChain(chainId) &&
          this.isSwappableChain(originChainId)
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
              symbol: asset.symbol,
              logoURI: asset.logo_uri,
              coingeckoId: asset.coingecko_id,
              decimals: asset.decimals ?? 0,
              isCw20: asset.is_cw20,
              isSvm: asset.is_svm,
              trace: asset.trace,
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
            const currencyFound = this.chainStore
              .getModularChainInfoImpl(chainId)
              .findCurrencyWithoutReaction(coinMinimalDenom);
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
                symbol: asset.symbol,
                logoURI: asset.logo_uri,
                coingeckoId: asset.coingecko_id,
                decimals: currencyFound.coinDecimals,
                isCw20: asset.is_cw20,
                isSvm: asset.is_svm,
                trace: asset.trace,
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
  get assetsOnlySwapUsages(): SwapAsset[] {
    if (
      !this.response ||
      !this.response.data ||
      !this.response.data.chain_to_assets_map
    ) {
      return [];
    }

    if (!this.isSwappableChain(this.chainId)) {
      return [];
    }

    const chainInfo = this.chainStore.getModularChain(this.chainId);
    if (!this.chainStore.isInModularChainInfosInListUI(chainInfo.chainId)) {
      return [];
    }

    const assetsInResponse =
      this.response.data.chain_to_assets_map[chainInfo.chainId];
    if (assetsInResponse) {
      const res: SwapAsset[] = [];

      for (const asset of assetsInResponse.assets) {
        if (
          this.isSwappableChain(asset.chain_id) &&
          this.isSwappableChain(asset.origin_chain_id)
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
          } else if (
            this.chainStore
              .getModularChainInfoImpl(this.chainId)
              .findCurrencyWithoutReaction(asset.denom)
          ) {
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

  protected isSwappableChain(chainId: string): boolean {
    return (
      this.chainStore.hasModularChain(chainId) &&
      this.chainStore
        .getModularChainInfoImpl(chainId)
        .matchModules({ or: ["cosmos", "evm"] })
    );
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

export class ObservableQueryAssetsBatchInner extends ObservableQuery<AssetsResponse> {
  constructor(
    sharedContext: QuerySharedContext,
    protected readonly chainStore: InternalChainStore,
    protected readonly swapUsageQueries: SwapUsageQueries,
    skipURL: string,
    public readonly chainIds: string[],
    options?: Partial<QueryOptions>
  ) {
    super(
      sharedContext,
      skipURL,
      `/v1/swap/assets?${chainIds
        .map((chainId) => `chain_id=${chainId.replace("eip155:", "")}`)
        .join("&")}`,
      options
    );

    makeObservable(this);
  }

  @computed
  get assetsRawBatch(): {
    chainId: string;
    assets: Asset[];
  }[] {
    if (
      !this.response ||
      !this.response.data ||
      !this.response.data.chain_to_assets_map
    ) {
      return [];
    }

    const result: {
      chainId: string;
      assets: Asset[];
    }[] = [];

    for (const chainId of this.chainIds) {
      if (!this.isSwappableChain(chainId)) {
        continue;
      }

      const chainInfo = this.chainStore.getModularChain(chainId);
      if (!this.chainStore.isInModularChainInfosInListUI(chainInfo.chainId)) {
        continue;
      }

      const assetsInResponse =
        this.response.data.chain_to_assets_map[chainId.replace("eip155:", "")];
      if (assetsInResponse) {
        const assets: Asset[] = [];

        for (const asset of assetsInResponse.assets) {
          const assetChainId = !Number.isNaN(parseInt(asset.chain_id))
            ? `eip155:${asset.chain_id}`
            : asset.chain_id;
          const originChainId = !Number.isNaN(parseInt(asset.origin_chain_id))
            ? `eip155:${asset.origin_chain_id}`
            : asset.origin_chain_id;
          if (
            this.isSwappableChain(assetChainId) &&
            (this.isSwappableChain(originChainId) ||
              (asset.chain_id === "osmosis-1" &&
                asset.denom ===
                  "ibc/0FA9232B262B89E77D1335D54FB1E1F506A92A7E4B51524B400DC69C68D28372"))
          ) {
            // IBC asset일 경우 그냥 넣는다.
            if (asset.denom.startsWith("ibc/")) {
              assets.push({
                denom: asset.denom,
                chainId: assetChainId,
                originDenom: asset.origin_denom,
                originChainId: originChainId,
                isEvm: false,
                recommendedSymbol: asset.recommended_symbol,
                symbol: asset.symbol,
                logoURI: asset.logo_uri,
                coingeckoId: asset.coingecko_id,
                decimals: asset.decimals ?? 0,
                isCw20: asset.is_cw20,
                isSvm: asset.is_svm,
                trace: asset.trace,
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
              if (asset.decimals != null && asset.decimals <= 18) {
                assets.push({
                  denom: coinMinimalDenom,
                  chainId: assetChainId,
                  originDenom: originCoinMinimalDenom,
                  originChainId: originChainId,
                  isEvm: asset.is_evm,
                  tokenContract: asset.token_contract,
                  recommendedSymbol: asset.recommended_symbol,
                  symbol: asset.symbol,
                  logoURI: asset.logo_uri,
                  coingeckoId: asset.coingecko_id,
                  decimals: asset.decimals,
                  isCw20: asset.is_cw20,
                  isSvm: asset.is_svm,
                  trace: asset.trace,
                });
              }
            }
          }
        }

        if (assets.length > 0) {
          result.push({
            chainId,
            assets,
          });
        }
      }
    }

    return result;
  }

  @computed
  get assetsBatch(): {
    chainId: string;
    assets: Asset[];
  }[] {
    if (
      !this.response ||
      !this.response.data ||
      !this.response.data.chain_to_assets_map
    ) {
      return [];
    }

    const result: {
      chainId: string;
      assets: Asset[];
    }[] = [];

    for (const chainId of this.chainIds) {
      if (!this.isSwappableChain(chainId)) {
        continue;
      }

      const chainInfo = this.chainStore.getModularChain(chainId);
      if (!this.chainStore.isInModularChainInfosInListUI(chainInfo.chainId)) {
        continue;
      }

      const assetsInResponse =
        this.response.data.chain_to_assets_map[chainId.replace("eip155:", "")];
      if (assetsInResponse) {
        const assets: Asset[] = [];

        for (const asset of assetsInResponse.assets) {
          const assetChainId = !Number.isNaN(parseInt(asset.chain_id))
            ? `eip155:${asset.chain_id}`
            : asset.chain_id;
          const originChainId = !Number.isNaN(parseInt(asset.origin_chain_id))
            ? `eip155:${asset.origin_chain_id}`
            : asset.origin_chain_id;
          if (
            this.isSwappableChain(assetChainId) &&
            this.isSwappableChain(originChainId)
          ) {
            // IBC asset일 경우 그냥 넣는다.
            if (asset.denom.startsWith("ibc/")) {
              assets.push({
                denom: asset.denom,
                chainId: assetChainId,
                originDenom: asset.origin_denom,
                originChainId: originChainId,
                isEvm: false,
                recommendedSymbol: asset.recommended_symbol,
                symbol: asset.symbol,
                logoURI: asset.logo_uri,
                coingeckoId: asset.coingecko_id,
                decimals: asset.decimals ?? 0,
                isCw20: asset.is_cw20,
                isSvm: asset.is_svm,
                trace: asset.trace,
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
              const currencyFound = this.chainStore
                .getModularChainInfoImpl(chainId)
                .findCurrencyWithoutReaction(coinMinimalDenom);
              // decimals이 18 이하인 경우만을 고려해서 짜여진 코드가 많아서 임시로 18 이하인 경우만 고려한다.
              // TODO: Dec, Int 같은 곳에서 18 이상인 경우도 고려하도록 수정
              if (currencyFound && currencyFound.coinDecimals <= 18) {
                assets.push({
                  denom: coinMinimalDenom,
                  chainId: assetChainId,
                  originDenom: originCoinMinimalDenom,
                  originChainId: originChainId,
                  isEvm: asset.is_evm,
                  tokenContract: asset.token_contract,
                  recommendedSymbol: asset.recommended_symbol,
                  symbol: asset.symbol,
                  logoURI: asset.logo_uri,
                  coingeckoId: asset.coingecko_id,
                  decimals: currencyFound.coinDecimals,
                  isCw20: asset.is_cw20,
                  isSvm: asset.is_svm,
                  trace: asset.trace,
                });
              }
            }
          }
        }

        if (assets.length > 0) {
          result.push({
            chainId,
            assets,
          });
        }
      }
    }

    return result;
  }

  @computed
  get assetsOnlySwapUsages(): {
    chainId: string;
    assets: SwapAsset[];
  }[] {
    if (
      !this.response ||
      !this.response.data ||
      !this.response.data.chain_to_assets_map
    ) {
      return [];
    }

    const result: {
      chainId: string;
      assets: SwapAsset[];
    }[] = [];

    for (const chainId of this.chainIds) {
      if (!this.isSwappableChain(chainId)) {
        continue;
      }

      const chainInfo = this.chainStore.getModularChain(chainId);
      if (!this.chainStore.isInModularChainInfosInListUI(chainInfo.chainId)) {
        continue;
      }

      const assetsInResponse =
        this.response.data.chain_to_assets_map[chainInfo.chainId];
      if (assetsInResponse) {
        const assets: SwapAsset[] = [];

        for (const asset of assetsInResponse.assets) {
          if (
            this.isSwappableChain(asset.chain_id) &&
            this.isSwappableChain(asset.origin_chain_id)
          ) {
            if (
              !this.swapUsageQueries.querySwapUsage
                .getSwapUsage(chainId)
                .isSwappable(asset.denom)
            ) {
              continue;
            }

            // IBC asset일 경우 그냥 넣는다.
            if (asset.denom.startsWith("ibc/")) {
              assets.push({
                denom: asset.denom,
                chainId: asset.chain_id,
                originDenom: asset.origin_denom,
                originChainId: asset.origin_chain_id,
              });
              // IBC asset이 아니라면 알고있는 currency만 넣는다.
            } else if (
              this.chainStore
                .getModularChainInfoImpl(chainId)
                .findCurrencyWithoutReaction(asset.denom)
            ) {
              assets.push({
                denom: asset.denom,
                chainId: asset.chain_id,
                originDenom: asset.origin_denom,
                originChainId: asset.origin_chain_id,
              });
            }
          }
        }

        if (assets.length > 0) {
          result.push({
            chainId,
            assets,
          });
        }
      }
    }

    return result;
  }

  protected isSwappableChain(chainId: string): boolean {
    return (
      this.chainStore.hasModularChain(chainId) &&
      this.chainStore
        .getModularChainInfoImpl(chainId)
        .matchModules({ or: ["cosmos", "evm"] })
    );
  }

  protected override async fetchResponse(
    abortController: AbortController
  ): Promise<{ headers: any; data: AssetsResponse }> {
    const _result = await simpleFetch(this.baseURL, this.url, {
      signal: abortController.signal,
      headers: {
        "content-type": "application/json",
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

export class ObservableQueryAssetsBatch extends HasMapStore<ObservableQueryAssetsBatchInner> {
  @observable
  private chainIdToBatchKeysMap: Map<string, Set<string>> = new Map();

  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainStore: InternalChainStore,
    protected readonly swapUsageQueries: SwapUsageQueries,
    protected readonly skipURL: string,
    protected readonly options?: Partial<QueryOptions & { batchSize: number }>
  ) {
    super((key) => {
      const chainIds = ObservableQueryAssetsBatch.deserializeChainIds(key);
      if (chainIds.length === 0) {
        throw new Error("Chain IDs cannot be empty");
      }

      if (this.options?.batchSize && this.options.batchSize < 1) {
        throw new Error("Batch size must be greater than 0");
      }

      runInAction(() => {
        for (const chainId of chainIds) {
          if (!this.chainIdToBatchKeysMap.has(chainId)) {
            this.chainIdToBatchKeysMap.set(chainId, new Set());
          }
          this.chainIdToBatchKeysMap.get(chainId)?.add(key);
        }
      });

      return new ObservableQueryAssetsBatchInner(
        this.sharedContext,
        this.chainStore,
        this.swapUsageQueries,
        this.skipURL,
        chainIds,
        this.options
      );
    });
  }

  getAssetsBatch(chainIds: string[]): ObservableQueryAssetsBatchInner {
    return this.get(ObservableQueryAssetsBatch.serializeChainIds(chainIds));
  }

  findCachedAssetsBatch = computedFn((chainIds: string[]) => {
    const missingChainIds = new Set<string>();
    const assets = new Map<string, Asset[]>();

    const relevantKeys = new Set<string>();
    for (const chainId of chainIds) {
      const keys = this.chainIdToBatchKeysMap.get(chainId);
      if (keys) {
        for (const key of keys) {
          relevantKeys.add(key);
        }
      } else {
        missingChainIds.add(chainId);
      }
    }

    for (const key of relevantKeys) {
      const instance = this.get(key);
      if (instance) {
        for (const {
          chainId,
          assets: chainAssets,
        } of instance.assetsRawBatch) {
          if (chainIds.includes(chainId)) {
            assets.set(chainId, chainAssets);
          }
        }
      } else {
        const cachedChainIds =
          ObservableQueryAssetsBatch.deserializeChainIds(key);
        for (const chainId of cachedChainIds) {
          if (chainIds.includes(chainId)) {
            missingChainIds.add(chainId);
          }
        }
      }
    }

    if (missingChainIds.size > 0) {
      const missingChainIdsArray = Array.from(missingChainIds);

      const batches = [];

      if (this.options?.batchSize) {
        for (
          let i = 0;
          i < missingChainIdsArray.length;
          i += this.options.batchSize
        ) {
          batches.push(
            missingChainIdsArray.slice(i, i + this.options.batchSize)
          );
        }
      } else {
        batches.push(missingChainIdsArray);
      }

      for (const batchChainIds of batches) {
        const batchQuery = this.getAssetsBatch(batchChainIds);
        const batchResults = batchQuery.assetsRawBatch;

        for (const { chainId, assets: chainAssets } of batchResults) {
          assets.set(chainId, chainAssets);
        }
      }
    }

    const sortedAssets = new Map(
      Array.from(assets.entries()).sort(([a], [b]) => a.localeCompare(b))
    );

    return sortedAssets;
  });

  static serializeChainIds(chainIds: string[]): string {
    return JSON.stringify(chainIds);
  }

  static deserializeChainIds(key: string): string[] {
    return JSON.parse(key) as string[];
  }
}
