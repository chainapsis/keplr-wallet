import { AppCurrency, ERC20Currency } from "@keplr-wallet/types";
import { ChainStore, IQueriesStore } from "@keplr-wallet/stores";
import { DenomHelper, KVStore } from "@keplr-wallet/common";
import { makeObservable, observable, runInAction } from "mobx";
import { EthereumQueries } from "./queries";
import { KeplrETCQueries } from "@keplr-wallet/stores-etc";

type CurrencyCache =
  | {
      notFound: undefined;
      symbol: string;
      decimals: number;
      coingeckoId?: string;
      logoURI?: string;
      timestamp: number;
    }
  | {
      notFound: true;
      timestamp: number;
    };

export class ERC20CurrencyRegistrar {
  @observable
  public _isInitialized = false;

  protected cacheERC20Metadata: Map<string, CurrencyCache> = new Map();
  protected staledERC20Metadata: Map<string, CurrencyCache> = new Map();

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly cacheDuration: number = 24 * 3600 * 1000, // 1 days
    protected readonly failedCacheDuration: number = 1 * 3600 * 1000, // 1 hours
    protected readonly chainStore: ChainStore,
    protected readonly queriesStore: IQueriesStore<
      EthereumQueries & KeplrETCQueries
    >
  ) {
    this.chainStore.registerCurrencyRegistrar(
      this.currencyRegistrar.bind(this)
    );

    makeObservable(this);

    this.init();
  }

  async init(): Promise<void> {
    const dbKey = `cacheERC20Metadata-v2`;
    const saved = await this.kvStore.get<Record<string, CurrencyCache>>(dbKey);
    if (saved) {
      for (const [key, value] of Object.entries(saved)) {
        this.cacheERC20Metadata.set(key, value);
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
    if (!this.chainStore.hasChain(chainId)) {
      return;
    }

    const denomHelper = new DenomHelper(coinMinimalDenom);
    if (denomHelper.type !== "erc20") {
      return;
    }

    if (!this.isInitialized) {
      return {
        value: undefined,
        done: false,
      };
    }

    const contractAddress = denomHelper.denom.replace("erc20:", "");

    let isGlobalFetching = false;
    const res = this.getERC20Metadata(chainId, contractAddress);
    if (res.isFetching) {
      isGlobalFetching = true;
    }
    const erc20Currency: ERC20Currency | undefined = res.res
      ? {
          type: "erc20",
          coinMinimalDenom: denomHelper.denom,
          contractAddress,
          coinDenom: res.res.coinDenom,
          coinImageUrl: res.res.coinImageUrl,
          coinGeckoId: res.res.coingeckoId,
          coinDecimals: res.res.decimals,
        }
      : undefined;
    if (!res.isFetching && !res.fromCache) {
      if (erc20Currency) {
        this.setCacheERC20Metadata(chainId, contractAddress, {
          notFound: undefined,
          symbol: erc20Currency.coinDenom,
          decimals: erc20Currency.coinDecimals,
          coingeckoId: erc20Currency.coinGeckoId,
          logoURI: erc20Currency.coinImageUrl,
          timestamp: Date.now(),
        });
      } else if (res.notFound) {
        this.setCacheERC20Metadata(chainId, contractAddress, {
          notFound: true,
          timestamp: Date.now(),
        });
      }
    }
    if (erc20Currency) {
      return {
        value: {
          ...erc20Currency,
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

  protected getERC20Metadata(
    chainId: string,
    contractAddress: string
  ): {
    res:
      | {
          coinDenom: string;
          decimals: number;
          coingeckoId: string | undefined;
          coinImageUrl: string | undefined;
        }
      | undefined;
    isFetching: boolean;
    fromCache: boolean;
    notFound: boolean;
  } {
    const { res: cached, staled } = this.getCacheERC20Metadata(
      chainId,
      contractAddress
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
          res: {
            coinDenom: cached.symbol,
            decimals: cached.decimals,
            coingeckoId: cached.coingeckoId,
            coinImageUrl: cached.logoURI,
          },
          isFetching: false,
          fromCache: true,
          notFound: false,
        };
      }
    }

    const queries = this.queriesStore.get(chainId);

    let isGlobalFetching = false;

    if (queries.ethereum) {
      const contractInfo =
        queries.ethereum.queryEthereumCoingeckoTokenInfo.getQueryContract(
          contractAddress
        );
      if (contractInfo) {
        const cachedRes:
          | {
              coinDenom: string;
              decimals: number;
              coingeckoId: string | undefined;
              coinImageUrl: string | undefined;
            }
          | undefined = cached
          ? {
              coinDenom: cached.symbol,
              decimals: cached.decimals,
              coingeckoId: cached.coingeckoId,
              coinImageUrl: cached.logoURI,
            }
          : undefined;

        if (contractInfo.isFetching) {
          isGlobalFetching = true;
        }
        if (contractInfo.symbol != null && contractInfo.decimals != null) {
          return {
            res: {
              coinDenom: contractInfo.symbol,
              decimals: contractInfo.decimals,
              coingeckoId: contractInfo.coingeckoId,
              coinImageUrl: contractInfo.logoURI,
            },
            isFetching: isGlobalFetching,
            fromCache: false,
            notFound: false,
          };
        } else {
          const notFound = contractInfo?.error?.status === 404;
          if (notFound) {
            const skipTokenInfoQuery =
              queries.keplrETC.querySkipTokenInfo.getQueryCoinMinimalDenom(
                `erc20:${contractAddress}`
              );
            if (skipTokenInfoQuery.isFetching) {
              isGlobalFetching = true;
            }
            if (skipTokenInfoQuery.currency) {
              return {
                res: {
                  coinDenom: skipTokenInfoQuery.currency.coinDenom,
                  decimals: skipTokenInfoQuery.currency.coinDecimals,
                  coingeckoId: skipTokenInfoQuery.currency.coinGeckoId,
                  coinImageUrl: skipTokenInfoQuery.currency.coinImageUrl,
                },
                isFetching: isGlobalFetching,
                fromCache: false,
                notFound: false,
              };
            } else {
              return {
                res:
                  skipTokenInfoQuery?.error?.status === 404
                    ? undefined
                    : cachedRes,
                isFetching: isGlobalFetching,
                fromCache: false,
                notFound: skipTokenInfoQuery?.error?.status === 404,
              };
            }
          } else {
            return {
              res: cachedRes,
              isFetching: isGlobalFetching,
              fromCache: false,
              notFound,
            };
          }
        }
      } else {
        return {
          res: undefined,
          isFetching: false,
          fromCache: false,
          notFound: false,
        };
      }
    } else {
      return {
        res: undefined,
        isFetching: false,
        fromCache: false,
        notFound: false,
      };
    }
  }

  protected getCacheERC20Metadata(
    chainId: string,
    contractAddress: string
  ): { res: CurrencyCache | undefined; staled: boolean } {
    const key = `${chainId}/${contractAddress}`;

    let res =
      this.cacheERC20Metadata.get(key) || this.staledERC20Metadata.get(key);
    let staled = false;

    if (res) {
      if (res.notFound) {
        if (Date.now() - res.timestamp > this.failedCacheDuration) {
          this.cacheERC20Metadata.delete(key);
          {
            const dbKey = `cacheERC20Metadata-v2`;
            const obj = Object.fromEntries(this.cacheERC20Metadata);
            this.kvStore.set<Record<string, CurrencyCache>>(dbKey, obj);
          }
          res = undefined;
          staled = false;
        }
      } else if (Date.now() - res.timestamp > this.cacheDuration) {
        this.cacheERC20Metadata.delete(key);

        const savedStaled = this.staledERC20Metadata.has(key);
        if (!savedStaled) {
          const dbKey = `cacheERC20Metadata-v2`;
          const obj = Object.fromEntries(this.cacheERC20Metadata);
          this.kvStore.set<Record<string, CurrencyCache>>(dbKey, obj);

          this.staledERC20Metadata.set(key, res);
        }

        staled = true;
      }
    }

    return {
      res,
      staled,
    };
  }

  protected setCacheERC20Metadata(
    chainId: string,
    contractAddress: string,
    cache: CurrencyCache
  ): void {
    const key = `${chainId}/${contractAddress}`;

    this.cacheERC20Metadata.set(key, cache);
    {
      const dbKey = `cacheERC20Metadata-v2`;
      const obj = Object.fromEntries(this.cacheERC20Metadata);
      this.kvStore.set<Record<string, CurrencyCache>>(dbKey, obj);
    }

    if (this.staledERC20Metadata.has(key)) {
      this.staledERC20Metadata.set(key, cache);
    }
  }
}
