import { AppCurrency } from "@keplr-wallet/types";
import { ChainStore, IQueriesStore } from "@keplr-wallet/stores";
import { KVStore } from "@keplr-wallet/common";
import { DeepReadonly } from "utility-types";
import { ObservableQueryEVMTokenInfo } from "./token-info";
import { autorun, makeObservable, observable, runInAction, toJS } from "mobx";

export class AxelarEVMBridgeCurrencyRegistrar {
  @observable
  public _isInitialized = false;

  // Key: ${chain}/${minimalDenom}
  @observable.shallow
  protected cacheMetadata: Map<
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
    protected readonly queriesStore: IQueriesStore<{
      keplrETC: {
        readonly queryEVMTokenInfo: DeepReadonly<ObservableQueryEVMTokenInfo>;
      };
    }>,
    public readonly mainChain: string
  ) {
    this.chainStore.registerCurrencyRegistrar(
      this.currencyRegistrar.bind(this)
    );

    makeObservable(this);

    this.init();
  }

  async init(): Promise<void> {
    const key = `cacheMetadata`;
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
            this.cacheMetadata.set(key, value);
          }
        }
      });
    }

    autorun(() => {
      const js = toJS(this.cacheMetadata);
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
    if (!this.chainStore.hasModularChain(chainId)) {
      return;
    }

    const chainInfo = this.chainStore.getModularChainInfoImpl(chainId);
    if (!chainInfo.hasFeature("axelar-evm-bridge")) {
      return;
    }

    const cacheKey = `${chainId}/${coinMinimalDenom}`;
    const cached = this.cacheMetadata.get(cacheKey);
    if (cached) {
      if (Date.now() - cached.timestamp < this.cacheDuration) {
        return {
          value: {
            coinMinimalDenom,
            coinDenom: cached.symbol,
            coinDecimals: cached.decimals,
          },
          done: true,
        };
      } else {
        runInAction(() => {
          this.cacheMetadata.delete(cacheKey);
        });
      }
    }

    const queries = this.queriesStore.get(chainId);

    const tokenInfo = queries.keplrETC.queryEVMTokenInfo.getAsset(
      this.mainChain,
      coinMinimalDenom
    );
    if (
      tokenInfo.symbol &&
      tokenInfo.decimals != null &&
      tokenInfo.isConfirmed
    ) {
      if (!tokenInfo.isFetching) {
        runInAction(() => {
          this.cacheMetadata.set(cacheKey, {
            symbol: tokenInfo.symbol!,
            decimals: tokenInfo.decimals!,
            timestamp: Date.now(),
          });
        });
      }

      return {
        value: {
          coinMinimalDenom,
          coinDenom: tokenInfo.symbol,
          coinDecimals: tokenInfo.decimals,
        },
        done: !tokenInfo.isFetching,
      };
    }

    if (tokenInfo.isFetching) {
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
