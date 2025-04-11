import { AppCurrency } from "@keplr-wallet/types";
import { ChainStore, IQueriesStore } from "@keplr-wallet/stores";
import { DenomHelper, KVStore } from "@keplr-wallet/common";
import { autorun, makeObservable, observable, runInAction, toJS } from "mobx";
import { EthereumQueries } from "./queries";
import { KeplrETCQueries } from "@keplr-wallet/stores-etc";

interface CurrencyCache {
  symbol: string;
  decimals: number;
  coingeckoId?: string;
  logoURI?: string;
  timestamp: number;
}
export class ERC20CurrencyRegistrar {
  @observable
  public _isInitialized = false;

  @observable.shallow
  protected cacheERC20Metadata: Map<string, CurrencyCache> = new Map();

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly cacheDuration: number = 24 * 3600 * 1000, // 1 days
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
    const key = `cacheERC20Metadata`;
    const saved = await this.kvStore.get<Record<string, CurrencyCache>>(key);
    if (saved) {
      runInAction(() => {
        for (const [key, value] of Object.entries(saved)) {
          if (Date.now() - value.timestamp < this.cacheDuration) {
            this.cacheERC20Metadata.set(key, value);
          }
        }
      });
    }

    autorun(() => {
      const js = toJS(this.cacheERC20Metadata);
      const obj = Object.fromEntries(js);
      this.kvStore.set<Record<string, CurrencyCache>>(key, obj);
    });

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

    const contractAddress = denomHelper.denom.replace("erc20:", "");

    const cached = this.cacheERC20Metadata.get(contractAddress);
    if (cached) {
      if (Date.now() - cached.timestamp < this.cacheDuration) {
        return {
          value: {
            coinMinimalDenom: denomHelper.denom,
            coinDenom: cached.symbol,
            coinDecimals: cached.decimals,
            coinGeckoId: cached.coingeckoId,
            coinImageUrl: cached.logoURI,
          },
          done: true,
        };
      } else {
        runInAction(() => {
          this.cacheERC20Metadata.delete(contractAddress);
        });
      }
    }

    const queries = this.queriesStore.get(chainId);
    const tokenInfoQuery =
      queries.ethereum.queryEthereumCoingeckoTokenInfo.getQueryContract(
        contractAddress
      );

    if (tokenInfoQuery?.symbol != null && tokenInfoQuery?.decimals != null) {
      if (!tokenInfoQuery.isFetching) {
        runInAction(() => {
          this.cacheERC20Metadata.set(contractAddress, {
            symbol: tokenInfoQuery.symbol!,
            decimals: tokenInfoQuery.decimals!,
            coingeckoId: tokenInfoQuery.coingeckoId,
            logoURI: tokenInfoQuery.logoURI,
            timestamp: Date.now(),
          });
        });
      }

      return {
        value: {
          coinMinimalDenom: denomHelper.denom,
          coinDenom: tokenInfoQuery.symbol,
          coinDecimals: tokenInfoQuery.decimals,
          coinGeckoId: tokenInfoQuery.coingeckoId,
          coinImageUrl: tokenInfoQuery.logoURI,
        },
        done: !tokenInfoQuery.isFetching,
      };
    }

    if (tokenInfoQuery?.isFetching) {
      return {
        value: undefined,
        done: false,
      };
    }

    const skipTokenInfoQuery =
      queries.keplrETC.querySkipTokenInfo.getQueryCoinMinimalDenom(
        coinMinimalDenom
      );
    if (skipTokenInfoQuery?.currency) {
      runInAction(() => {
        this.cacheERC20Metadata.set(contractAddress, {
          symbol: skipTokenInfoQuery.currency!.coinDenom,
          decimals: skipTokenInfoQuery.currency!.coinDecimals,
          coingeckoId: skipTokenInfoQuery.currency!.coinGeckoId,
          logoURI: skipTokenInfoQuery.currency!.coinImageUrl,
          timestamp: Date.now(),
        });
      });

      return {
        value: skipTokenInfoQuery.currency,
        done: !skipTokenInfoQuery.isFetching,
      };
    }

    if (skipTokenInfoQuery?.isFetching) {
      return {
        value: undefined,
        done: false,
      };
    }

    return {
      value: undefined,
      done: true,
    };
  }
}
