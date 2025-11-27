import { AppCurrency, Currency } from "@keplr-wallet/types";
import { ChainStore } from "../chain";
import { DenomHelper, KVStore } from "@keplr-wallet/common";
import { makeObservable, observable, runInAction } from "mobx";
import { IQueriesStore } from "../query";
import { ChainIdHelper } from "@keplr-wallet/cosmos";

type Cache =
  | {
      notFound: undefined;
      currency: Currency;
      timestamp: number;
    }
  | {
      notFound: true;
      timestamp: number;
    };

export class TokenFactoryCurrencyRegistrar {
  @observable
  public _isInitialized = false;

  protected cache: Map<string, Cache> = new Map();
  protected staledCache: Map<string, Cache> = new Map();

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly cacheDuration: number = 24 * 3600 * 1000, // 1 days
    protected readonly failedCacheDuration: number = 1 * 3600 * 1000, // 1 hours
    protected readonly baseURL: string,
    protected readonly uri: string,
    protected readonly chainStore: ChainStore,
    protected readonly queriesStore: IQueriesStore
  ) {
    this.chainStore.registerCurrencyRegistrar(
      this.currencyRegistrar.bind(this)
    );

    makeObservable(this);

    this.init();
  }

  async init(): Promise<void> {
    const dbKey = `cache-token-factory-registrar`;
    const saved = await this.kvStore.get<Record<string, Cache>>(dbKey);
    if (saved) {
      for (const [key, value] of Object.entries(saved)) {
        this.cache.set(key, value);
      }
    }

    runInAction(() => {
      this._isInitialized = true;
    });
  }

  get isInitialized(): boolean {
    return this._isInitialized;
  }

  protected currencyRegistrar(
    chainId: string,
    coinMinimalDenom: string
  ):
    | {
        value: AppCurrency | undefined;
        done: boolean;
      }
    | undefined {
    if (!this.baseURL) {
      return;
    }

    if (!this.chainStore.hasModularChain(chainId)) {
      return;
    }

    const denomHelper = new DenomHelper(coinMinimalDenom);
    if (
      denomHelper.type !== "native" ||
      !denomHelper.denom.startsWith("factory/")
    ) {
      return;
    }

    if (!this.isInitialized) {
      return {
        value: undefined,
        done: false,
      };
    }

    let isGlobalFetching = false;
    const res = this.getCurrency(chainId, coinMinimalDenom);
    if (res.isFetching) {
      isGlobalFetching = true;
    }
    const currency = res.res;
    if (!res.isFetching && !res.fromCache) {
      if (currency) {
        this.setCache(chainId, coinMinimalDenom, {
          notFound: undefined,
          currency,
          timestamp: Date.now(),
        });
      } else if (res.notFound) {
        this.setCache(chainId, coinMinimalDenom, {
          notFound: true,
          timestamp: Date.now(),
        });
      }
    }
    if (currency) {
      return {
        value: {
          ...currency,
        },
        done: !isGlobalFetching,
      };
    } else {
      return {
        value: undefined,
        done: !isGlobalFetching,
      };
    }
  }

  protected getCurrency(
    chainId: string,
    coinMinimalDenom: string
  ): {
    res: Currency | undefined;
    isFetching: boolean;
    fromCache: boolean;
    notFound: boolean;
  } {
    const { res: cached, staled } = this.getCacheCurrency(
      chainId,
      coinMinimalDenom
    );
    if (cached) {
      if (cached.notFound) {
        return {
          res: undefined,
          isFetching: false,
          fromCache: true,
          notFound: true,
        };
      }
      if (!staled) {
        return {
          res: cached.currency,
          isFetching: false,
          fromCache: true,
          notFound: false,
        };
      }
    }

    const queryCurrency = this.queriesStore.simpleQuery.queryGet<Currency>(
      this.baseURL,
      this.uri
        .replace("{chainId}", chainId)
        .replace("{denom}", encodeURIComponent(coinMinimalDenom))
    );

    let isGlobalFetching = false;
    const cahedRes: Currency | undefined = cached ? cached.currency : undefined;
    if (queryCurrency.isFetching) {
      isGlobalFetching = true;
    }

    if (queryCurrency.response) {
      if (queryCurrency.response.data.coinMinimalDenom !== coinMinimalDenom) {
        return {
          res: undefined,
          isFetching: isGlobalFetching,
          fromCache: false,
          notFound: true,
        };
      }

      return {
        res: queryCurrency.response.data,
        isFetching: isGlobalFetching,
        fromCache: false,
        notFound: false,
      };
    } else {
      const notFound = queryCurrency.error?.status === 404;
      return {
        res: notFound ? undefined : cahedRes,
        isFetching: isGlobalFetching,
        fromCache: false,
        notFound,
      };
    }
  }

  protected getCacheCurrency(
    chainId: string,
    coinMinimalDenom: string
  ): { res: Cache | undefined; staled: boolean } {
    const key = `${
      ChainIdHelper.parse(chainId).identifier
    }/${coinMinimalDenom}`;

    let res = this.cache.get(key) || this.staledCache.get(key);
    let staled = false;

    if (res) {
      if (res.notFound) {
        if (Date.now() - res.timestamp > this.failedCacheDuration) {
          this.cache.delete(key);
          {
            const dbKey = `cache-token-factory-registrar`;
            const obj = Object.fromEntries(this.cache);
            this.kvStore.set<Record<string, Cache>>(dbKey, obj);
          }
          res = undefined;
          staled = false;
        }
      } else if (Date.now() - res.timestamp > this.cacheDuration) {
        this.cache.delete(key);

        const savedStaled = this.staledCache.has(key);
        if (!savedStaled) {
          {
            const dbKey = `cache-token-factory-registrar`;
            const obj = Object.fromEntries(this.cache);
            this.kvStore.set<Record<string, Cache>>(dbKey, obj);
          }

          this.staledCache.set(key, res);
        }

        staled = true;
      }
    }

    return {
      res,
      staled,
    };
  }

  protected setCache(
    chainId: string,
    coinMinimalDenom: string,
    cache: Cache
  ): void {
    const key = `${
      ChainIdHelper.parse(chainId).identifier
    }/${coinMinimalDenom}`;

    this.cache.set(key, cache);
    {
      const dbKey = `cache-token-factory-registrar`;
      const obj = Object.fromEntries(this.cache);
      this.kvStore.set<Record<string, Cache>>(dbKey, obj);
    }

    if (this.staledCache.has(key)) {
      this.staledCache.set(key, cache);
    }
  }
}
