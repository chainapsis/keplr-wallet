import { AppCurrency, Currency } from "@keplr-wallet/types";
import { ChainStore } from "../chain";
import { DenomHelper, KVStore } from "@keplr-wallet/common";
import { autorun, makeObservable, observable, runInAction, toJS } from "mobx";
import { IQueriesStore } from "../query";

export class TokenFactoryCurrencyRegistrar {
  @observable
  public _isInitialized = false;

  @observable.shallow
  protected cache: Map<
    string,
    {
      currency: Currency;
      timestamp: number;
    }
  > = new Map();

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly cacheDuration: number = 24 * 3600 * 1000, // 1 days
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
    const key = `cache-token-factory-registrar`;
    const saved = await this.kvStore.get<
      Record<
        string,
        {
          currency: Currency;
          timestamp: number;
        }
      >
    >(key);
    if (saved) {
      runInAction(() => {
        for (const [key, value] of Object.entries(saved)) {
          if (Date.now() - value.timestamp < this.cacheDuration) {
            this.cache.set(key, value);
          }
        }
      });
    }

    autorun(() => {
      const js = toJS(this.cache);
      const obj = Object.fromEntries(js);
      this.kvStore.set<
        Record<
          string,
          {
            currency: Currency;
            timestamp: number;
          }
        >
      >(key, obj);
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
    if (!this.baseURL) {
      return;
    }

    if (!this.chainStore.hasChain(chainId)) {
      return;
    }

    const denomHelper = new DenomHelper(coinMinimalDenom);
    if (
      denomHelper.type !== "native" ||
      !denomHelper.denom.startsWith("factory/")
    ) {
      return;
    }

    const cached = this.cache.get(coinMinimalDenom);
    if (cached) {
      if (Date.now() - cached.timestamp < this.cacheDuration) {
        return {
          value: {
            ...cached.currency,
            coinMinimalDenom: denomHelper.denom,
          },
          done: true,
        };
      } else {
        runInAction(() => {
          this.cache.delete(coinMinimalDenom);
        });
      }
    }

    const queryCurrency = this.queriesStore.simpleQuery.queryGet<Currency>(
      this.baseURL,
      this.uri
        .replace("{chainId}", chainId)
        .replace("{denom}", encodeURIComponent(coinMinimalDenom))
    );
    if (queryCurrency.response) {
      if (queryCurrency.response.data.coinMinimalDenom !== coinMinimalDenom) {
        return {
          value: undefined,
          done: true,
        };
      }

      if (!queryCurrency.isFetching) {
        runInAction(() => {
          if (queryCurrency.response) {
            this.cache.set(coinMinimalDenom, {
              currency: queryCurrency.response.data,
              timestamp: Date.now(),
            });
          }
        });
      }

      return {
        value: {
          ...queryCurrency.response.data,
          coinMinimalDenom: denomHelper.denom,
        },
        done: !queryCurrency.isFetching,
      };
    }

    if (queryCurrency.isFetching) {
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
