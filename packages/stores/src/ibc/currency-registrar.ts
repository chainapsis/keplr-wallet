import { flow, makeObservable, observable, runInAction } from "mobx";
import { AppCurrency, ChainInfo } from "@keplr-wallet/types";
import { ChainInfoInner, ChainStore } from "../chain";
import { HasCosmosQueries, QueriesSetBase } from "../query";
import { DenomHelper, KVStore, toGenerator } from "@keplr-wallet/common";

type CacheIBCDenomData = {
  denomTrace: {
    denom: string;
    paths: {
      portId: string;
      channelId: string;
    }[];
  };
  originChainId: string | undefined;
  counterpartyChainId: string | undefined;
};

export class IBCCurrencyRegsitrarInner<C extends ChainInfo = ChainInfo> {
  @observable
  protected isInitialized = false;
  @observable
  protected isInitializing = false;

  /**
   * Because the `QueryStore` returns the response from cache first if the last response exists, it takes the IO.
   * But, if many unknown currencies requested, this make many IO and queries occur at the same time.
   * This can make the performance issue, so to reduce this problem, use the alternative caching logic
   * and the denom trace shouldn't be changed in the normal case.
   * To decrease the number of IO, make sure that reading from storage should happen when the unknown currencies exist
   * and don't split the data with keys and as posible as combine them to one data structure and key.
   * @protected
   */
  @observable.shallow
  protected cacheDenomTracePaths: Map<
    string,
    CacheIBCDenomData & { timestamp: number }
  > = new Map();

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly cacheDuration: number,
    protected readonly chainInfoInner: ChainInfoInner<C>,
    protected readonly chainStore: ChainStore<C>,
    protected readonly accountStore: {
      hasAccount(chainId: string): boolean;
      getAccount(
        chainId: string
      ): {
        bech32Address: string;
      };
    },
    protected readonly queriesStore: {
      get(chainId: string): QueriesSetBase & HasCosmosQueries;
    },
    protected readonly coinDenomGenerator: (
      denomTrace: {
        denom: string;
        paths: {
          portId: string;
          channelId: string;
        }[];
      },
      originChainInfo: ChainInfoInner | undefined,
      counterpartyChainInfo: ChainInfoInner | undefined,
      originCurrency: AppCurrency | undefined
    ) => string
  ) {
    makeObservable(this);
  }

  @flow
  protected *restoreCache() {
    this.isInitializing = true;

    const key = `cache-ibc-denom-trace-paths/${this.chainInfoInner.chainId}`;
    const obj = yield* toGenerator(
      this.kvStore.get<
        Record<string, CacheIBCDenomData & { timestamp: number }>
      >(key)
    );

    if (obj) {
      for (const key of Object.keys(obj)) {
        this.cacheDenomTracePaths.set(key, obj[key]);
      }
    }

    this.isInitialized = true;
    this.isInitializing = false;
  }

  protected getCacheIBCDenomData(
    denomTraceHash: string
  ): CacheIBCDenomData | undefined {
    const result = this.cacheDenomTracePaths.get(denomTraceHash);
    if (result && result.timestamp + this.cacheDuration > Date.now()) {
      return result;
    }
  }

  @flow
  protected *setCacheIBCDenomData(
    denomTraceHash: string,
    data: CacheIBCDenomData
  ) {
    this.cacheDenomTracePaths.set(denomTraceHash, {
      ...data,
      timestamp: Date.now(),
    });

    const obj: Record<string, CacheIBCDenomData> = {};

    this.cacheDenomTracePaths.forEach((value, key) => {
      obj[key] = value;
    });

    const key = `cache-ibc-denom-trace-paths/${this.chainInfoInner.chainId}`;
    yield this.kvStore.set(key, obj);
  }

  registerUnknownCurrencies(
    coinMinimalDenom: string
  ): [AppCurrency | undefined, boolean] | undefined {
    const denomHelper = new DenomHelper(coinMinimalDenom);
    if (
      denomHelper.type !== "native" ||
      !denomHelper.denom.startsWith("ibc/")
    ) {
      // IBC Currency's denom should start with "ibc/"
      return;
    }

    // When the unknown ibc denom is delivered, try to restore the cache from storage.
    if (!this.isInitialized) {
      this.restoreCache();
    }

    if (this.isInitializing) {
      return [undefined, false];
    }

    const queries = this.queriesStore.get(this.chainInfoInner.chainId);

    const hash = denomHelper.denom.replace("ibc/", "");

    const cached = this.getCacheIBCDenomData(hash);

    let counterpartyChainInfo: ChainInfoInner | undefined;
    let originChainInfo: ChainInfoInner | undefined;
    let denomTrace:
      | {
          denom: string;
          paths: {
            portId: string;
            channelId: string;
          }[];
        }
      | undefined;

    if (cached) {
      denomTrace = cached.denomTrace;
      if (
        cached.originChainId &&
        this.chainStore.hasChain(cached.originChainId)
      ) {
        originChainInfo = this.chainStore.getChain(cached.originChainId);
      }
      if (
        cached.counterpartyChainId &&
        this.chainStore.hasChain(cached.counterpartyChainId)
      ) {
        counterpartyChainInfo = this.chainStore.getChain(
          cached.counterpartyChainId
        );
      }
    } else {
      const queryDenomTrace = queries.cosmos.queryIBCDenomTrace.getDenomTrace(
        hash
      );
      denomTrace = queryDenomTrace.denomTrace;

      if (denomTrace) {
        const paths = denomTrace.paths;
        // The previous chain id from current path.
        let chainIdBefore = this.chainInfoInner.chainId;
        for (const path of paths) {
          const clientState = this.queriesStore
            .get(chainIdBefore)
            .cosmos.queryIBCClientState.getClientState(
              path.portId,
              path.channelId
            );

          if (
            clientState.clientChainId &&
            this.chainStore.hasChain(clientState.clientChainId)
          ) {
            chainIdBefore = clientState.clientChainId;
            originChainInfo = this.chainStore.getChain(
              clientState.clientChainId
            );
            if (!counterpartyChainInfo) {
              counterpartyChainInfo = this.chainStore.getChain(
                clientState.clientChainId
              );
            }
          } else {
            originChainInfo = undefined;
            break;
          }
        }

        if (originChainInfo) {
          this.setCacheIBCDenomData(hash, {
            counterpartyChainId: counterpartyChainInfo?.chainId,
            denomTrace,
            originChainId: originChainInfo.chainId,
          });
        }
      }
    }

    if (originChainInfo && denomTrace) {
      const currency = originChainInfo.forceFindCurrency(denomTrace.denom);

      if (!("type" in currency)) {
        return [
          {
            ...currency,
            coinMinimalDenom: denomHelper.denom,
            coinDenom: this.coinDenomGenerator(
              denomTrace,
              originChainInfo,
              counterpartyChainInfo,
              currency
            ),
            paths: denomTrace.paths,
            originChainId: originChainInfo.chainId,
            originCurrency: currency,
          },
          true,
        ];
      }

      // In this case, just show the raw currency.
      // But, it is possible to know the currency from query later.
      // So, let them to be observed.
      return [
        {
          coinDecimals: 0,
          coinMinimalDenom: denomHelper.denom,
          coinDenom: this.coinDenomGenerator(
            denomTrace,
            originChainInfo,
            counterpartyChainInfo,
            undefined
          ),
          paths: denomTrace.paths,
          originChainId: undefined,
          originCurrency: undefined,
        },
        false,
      ];
    }

    return [undefined, false];
  }
}

/**
 * IBCCurrencyRegsitrar gets the native balances that exist on the chain itself (ex. atom, scrt...)
 * And, IBCCurrencyRegsitrar registers the currencies from IBC to the chain info.
 * In cosmos-sdk, the denomination of IBC token has the form of "ibc/{hash}".
 * And, its paths can be found by getting the denom trace from the node.
 * If the native balance querier's response have the token that is form of IBC token,
 * this will try to get the denom info by traversing the paths, and register the currency with the decimal and denom info.
 * But, if failed to traverse the paths, this will register the currency with 0 decimal and the minimal denom even though it is not suitable for human.
 */
export class IBCCurrencyRegsitrar<C extends ChainInfo = ChainInfo> {
  @observable.shallow
  protected map: Map<string, IBCCurrencyRegsitrarInner<C>> = new Map();

  static defaultCoinDenomGenerator(
    denomTrace: {
      denom: string;
      paths: {
        portId: string;
        channelId: string;
      }[];
    },
    _: ChainInfoInner | undefined,
    counterpartyChainInfo: ChainInfoInner | undefined,
    originCurrency: AppCurrency | undefined
  ): string {
    if (originCurrency) {
      return `${originCurrency.coinDenom} (${
        counterpartyChainInfo ? counterpartyChainInfo.chainName : "Unknown"
      }/${denomTrace.paths[0].channelId})`;
    } else {
      return `${denomTrace.denom} (${
        counterpartyChainInfo ? counterpartyChainInfo.chainName : "Unknown"
      }/${denomTrace.paths[0].channelId})`;
    }
  }

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly cacheDuration: number = 24 * 3600 * 1000, // 1 days
    protected readonly chainStore: ChainStore<C>,
    protected readonly accountStore: {
      hasAccount(chainId: string): boolean;
      getAccount(
        chainId: string
      ): {
        bech32Address: string;
      };
    },
    protected readonly queriesStore: {
      get(chainId: string): QueriesSetBase & HasCosmosQueries;
    },
    protected readonly coinDenomGenerator: (
      denomTrace: {
        denom: string;
        paths: {
          portId: string;
          channelId: string;
        }[];
      },
      originChainInfo: ChainInfoInner | undefined,
      counterpartyChainInfo: ChainInfoInner | undefined,
      originCurrency: AppCurrency | undefined
    ) => string = IBCCurrencyRegsitrar.defaultCoinDenomGenerator
  ) {
    this.chainStore.addSetChainInfoHandler((chainInfoInner) =>
      this.setChainInfoHandler(chainInfoInner)
    );
  }

  setChainInfoHandler(chainInfoInner: ChainInfoInner<C>): void {
    const inner = this.get(chainInfoInner);
    chainInfoInner.registerCurrencyRegistrar((coinMinimalDenom) =>
      inner.registerUnknownCurrencies(coinMinimalDenom)
    );
  }

  protected get(
    chainInfoInner: ChainInfoInner<C>
  ): IBCCurrencyRegsitrarInner<C> {
    if (!this.map.has(chainInfoInner.chainId)) {
      runInAction(() => {
        this.map.set(
          chainInfoInner.chainId,
          new IBCCurrencyRegsitrarInner<C>(
            this.kvStore,
            this.cacheDuration,
            chainInfoInner,
            this.chainStore,
            this.accountStore,
            this.queriesStore,
            this.coinDenomGenerator
          )
        );
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.map.get(chainInfoInner.chainId)!;
  }
}
