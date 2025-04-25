import { action, makeObservable, observable, runInAction } from "mobx";
import { Asset, ObservableQueryAssetsBatch, SwapAsset } from "./assets";

const DEFAULT_CACHE_TTL = 3 * 60 * 1000; // 3 minutes by default

/**
 * A shared cache for assets that can be used by multiple components
 */
export class ObservableAssetsCache {
  @observable
  private assetsByChainIdCache = new Map<
    string,
    { data: Asset[] | SwapAsset[]; timestamp: number }
  >();

  constructor(
    protected readonly queryAssetsBatch: ObservableQueryAssetsBatch,
    protected readonly cacheTTL: number = DEFAULT_CACHE_TTL
  ) {
    makeObservable(this);
  }

  /**
   * Get cached assets for a chain
   * @param chainId The chain ID to get assets for
   * @returns The cached assets or null if not in cache or expired
   */
  getCachedAssetsForChain(chainId: string): Asset[] | SwapAsset[] | null {
    const cachedItem = this.assetsByChainIdCache.get(chainId);

    if (!cachedItem || Date.now() - cachedItem.timestamp > this.cacheTTL) {
      return null;
    }

    return cachedItem.data;
  }

  /**
   * Sets cached assets for a chain
   * @param chainId The chain ID to set assets for
   * @param assets The assets to cache
   */
  @action
  setCachedAssetsForChain(chainId: string, assets: Asset[] | SwapAsset[]) {
    this.assetsByChainIdCache.set(chainId, {
      data: [...assets],
      timestamp: Date.now(),
    });
  }

  /**
   * Clear the asset cache for a specific chain or all chains
   * @param chainId Optional chain ID to clear cache for. If not provided, clears all caches.
   */
  @action
  clearAssetCache(chainId?: string) {
    if (chainId) {
      this.assetsByChainIdCache.delete(chainId);
    } else {
      this.assetsByChainIdCache.clear();
    }
  }

  /**
   * Ensures assets are loaded for the specified chain IDs
   * @param chainIds Chain IDs to ensure assets are loaded for
   * @param checkCachedAssets Whether to check cached assets
   * @param useMobileAssets Whether to use mobile-specific assets
   * @returns True if all assets are loaded, false otherwise
   */
  ensureAssetsLoaded(
    chainIds: string[],
    checkCachedAssets: boolean = false,
    useMobileAssets: boolean = false
  ): boolean {
    const uniqueChainIds = Array.from(new Set(chainIds));

    if (checkCachedAssets) {
      uniqueChainIds.push(...this.assetsByChainIdCache.keys());
    }

    const missingOrExpiredChainIds = uniqueChainIds.filter((chainId) => {
      const cachedItem = this.assetsByChainIdCache.get(chainId);
      return !cachedItem || Date.now() - cachedItem.timestamp > this.cacheTTL;
    });

    if (missingOrExpiredChainIds.length === 0) {
      return true;
    }

    const queryAssetsBatch = this.queryAssetsBatch.getAssetsBatch(
      missingOrExpiredChainIds
    );

    const assetsBatch = useMobileAssets
      ? queryAssetsBatch.assetsOnlySwapUsages
      : queryAssetsBatch.assetsBatch;

    runInAction(() => {
      for (const entry of assetsBatch) {
        this.assetsByChainIdCache.set(entry.chainId, {
          data: [...entry.assets],
          timestamp: Date.now(),
        });
      }
    });

    return missingOrExpiredChainIds.every((chainId) =>
      this.assetsByChainIdCache.has(chainId)
    );
  }
}
