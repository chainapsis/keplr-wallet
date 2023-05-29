import { AppCurrency } from "@keplr-wallet/types";
import { ChainStore, IQueriesStore } from "@keplr-wallet/stores";
import { DenomHelper, KVStore } from "@keplr-wallet/common";
import { KeplrETCQueries } from "../queries";
import { autorun, makeObservable, observable, runInAction, toJS } from "mobx";

export class GravityBridgeCurrencyRegistrar {
  @observable
  public _isInitialized = false;

  @observable.shallow
  protected cacheERC20Metadata: Map<
    string,
    {
      symbol: string;
      decimals: number;
      timestamp: number;
    }
  > = new Map();

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly cacheDuration: number = 24 * 3600 * 1000, // 1 days
    protected readonly chainStore: ChainStore,
    protected readonly queriesStore: IQueriesStore<KeplrETCQueries>
  ) {
    this.chainStore.registerCurrencyRegistrar(
      this.currencyRegistrar.bind(this)
    );

    makeObservable(this);

    this.init();
  }

  async init(): Promise<void> {
    const key = `cacheERC20Metadata`;
    const saved = await this.kvStore.get<
      Record<
        string,
        {
          symbol: string;
          decimals: number;
          timestamp: number;
        }
      >
    >(key);
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
      this.kvStore.set<
        Record<
          string,
          {
            symbol: string;
            decimals: number;
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
    if (!this.chainStore.hasChain(chainId)) {
      return;
    }

    const denomHelper = new DenomHelper(coinMinimalDenom);
    if (
      denomHelper.type !== "native" ||
      !denomHelper.denom.startsWith("gravity0x")
    ) {
      return;
    }

    const queries = this.queriesStore.get(chainId);

    const contractAddress = denomHelper.denom.replace("gravity", "");

    const cached = this.cacheERC20Metadata.get(contractAddress);
    if (cached) {
      if (Date.now() - cached.timestamp < this.cacheDuration) {
        return {
          value: {
            coinMinimalDenom: denomHelper.denom,
            coinDenom: cached.symbol,
            coinDecimals: cached.decimals,
          },
          done: true,
        };
      } else {
        runInAction(() => {
          this.cacheERC20Metadata.delete(contractAddress);
        });
      }
    }

    const erc20Metadata =
      queries.keplrETC.queryERC20Metadata.get(contractAddress);
    if (erc20Metadata.symbol && erc20Metadata.decimals != null) {
      if (
        !erc20Metadata.querySymbol.isFetching &&
        !erc20Metadata.queryDecimals.isFetching
      ) {
        runInAction(() => {
          this.cacheERC20Metadata.set(contractAddress, {
            symbol: erc20Metadata.symbol!,
            decimals: erc20Metadata.decimals!,
            timestamp: Date.now(),
          });
        });
      }

      return {
        value: {
          coinMinimalDenom: denomHelper.denom,
          coinDenom: erc20Metadata.symbol,
          coinDecimals: erc20Metadata.decimals,
        },
        done:
          !erc20Metadata.querySymbol.isFetching &&
          !erc20Metadata.queryDecimals.isFetching,
      };
    }

    if (
      erc20Metadata.querySymbol.isFetching ||
      erc20Metadata.queryDecimals.isFetching
    ) {
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
