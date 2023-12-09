import {
  action,
  autorun,
  makeObservable,
  observable,
  runInAction,
  toJS,
} from "mobx";
import { AppCurrency, ChainInfo } from "@keplr-wallet/types";
import { IChainInfoImpl, ChainStore } from "../chain";
import { CosmosQueries, CosmwasmQueries, IQueriesStore } from "../query";
import { DenomHelper, KVStore } from "@keplr-wallet/common";
import { ChainIdHelper } from "@keplr-wallet/cosmos";

type CacheIBCDenomData = {
  denomTrace: {
    denom: string;
    paths: {
      portId: string;
      channelId: string;

      counterpartyChannelId?: string;
      counterpartyPortId?: string;
      clientChainId?: string;
    }[];
  };
  originChainId: string | undefined;
  counterpartyChainId: string | undefined;
  timestamp: number;
};

/**
 * IBCCurrencyRegistrar gets the native balances that exist on the chain itself (ex. atom, scrt...)
 * And, IBCCurrencyRegistrar registers the currencies from IBC to the chain info.
 * In cosmos-sdk, the denomination of IBC token has the form of "ibc/{hash}".
 * And, its paths can be found by getting the denom trace from the node.
 * If the native balance querier's response have the token that is form of IBC token,
 * this will try to get the denom info by traversing the paths, and register the currency with the decimal and denom info.
 * But, if failed to traverse the paths, this will register the currency with 0 decimal and the minimal denom even though it is not suitable for human.
 */
export class IBCCurrencyRegistrar {
  static defaultCoinDenomGenerator(
    denomTrace: {
      denom: string;
      paths: {
        portId: string;
        channelId: string;

        counterpartyChannelId?: string;
        counterpartyPortId?: string;
        clientChainId?: string;
      }[];
    },
    _: ChainInfo | undefined,
    counterpartyChainInfo: ChainInfo | undefined,
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
  protected cacheDenomTracePaths: Map<string, CacheIBCDenomData> = new Map();

  @observable
  public isInitialized = false;

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly cacheDuration: number = 24 * 3600 * 1000, // 1 days
    protected readonly chainStore: ChainStore,
    protected readonly accountStore: {
      hasAccount(chainId: string): boolean;
      getAccount(chainId: string): {
        bech32Address: string;
      };
    },
    protected readonly queriesStore: IQueriesStore<
      CosmosQueries & Partial<CosmwasmQueries>
    >,
    protected readonly coinDenomGenerator: (
      denomTrace: {
        denom: string;
        paths: {
          portId: string;
          channelId: string;

          counterpartyChannelId?: string;
          counterpartyPortId?: string;
          clientChainId?: string;
        }[];
      },
      originChainInfo: IChainInfoImpl | undefined,
      counterpartyChainInfo: IChainInfoImpl | undefined,
      originCurrency: AppCurrency | undefined
    ) => string = IBCCurrencyRegistrar.defaultCoinDenomGenerator
  ) {
    this.chainStore.registerCurrencyRegistrar(
      this.ibcCurrencyRegistrar.bind(this)
    );

    makeObservable(this);

    this.init();
  }

  protected async init() {
    // "cache-ibc-denom-trace-paths" is already used.
    // v2: Add "clientChainId", "counterpartyPortId", "counterpartyChannelId" fields to the paths.
    const key = `cache-ibc-denom-trace-paths-v2`;
    const saved = await this.kvStore.get<Record<string, CacheIBCDenomData>>(
      key
    );
    if (saved) {
      runInAction(() => {
        for (const [key, value] of Object.entries(saved)) {
          if (Date.now() - value.timestamp < this.cacheDuration) {
            this.cacheDenomTracePaths.set(key, value);
          }
        }
      });
    }

    autorun(() => {
      const js = toJS(this.cacheDenomTracePaths);
      const obj = Object.fromEntries(js);
      this.kvStore.set<Record<string, CacheIBCDenomData>>(key, obj);
    });

    runInAction(() => {
      this.isInitialized = true;
    });
  }

  protected ibcCurrencyRegistrar(
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
      !denomHelper.denom.startsWith("ibc/")
    ) {
      // IBC Currency's denom should start with "ibc/"
      return;
    }

    if (!this.isInitialized) {
      return {
        value: undefined,
        done: false,
      };
    }

    const queries = this.queriesStore.get(chainId);

    const hash = denomHelper.denom.replace("ibc/", "");

    let counterpartyChainInfo: IChainInfoImpl | undefined;
    let originChainInfo: IChainInfoImpl | undefined;
    let denomTrace:
      | {
          denom: string;
          paths: {
            portId: string;
            channelId: string;

            counterpartyChannelId?: string;
            counterpartyPortId?: string;
            clientChainId?: string;
          }[];
        }
      | undefined;

    let fromCache = false;

    const cached = this.getCacheIBCDenomData(chainId, hash);
    if (cached) {
      if (
        Date.now() - cached.timestamp < this.cacheDuration &&
        !cached.denomTrace.paths.some((path) => {
          if (!path.clientChainId) {
            return true;
          }
          return !this.chainStore.hasChain(path.clientChainId);
        })
      ) {
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

        fromCache = true;
      } else {
        runInAction(() => {
          this.cacheDenomTracePaths.delete(hash);
        });
      }
    } else {
      let isFetching = false;

      const queryDenomTrace =
        queries.cosmos.queryIBCDenomTrace.getDenomTrace(hash);
      denomTrace = queryDenomTrace.denomTrace;

      if (queryDenomTrace.isFetching) {
        isFetching = true;
      }

      if (denomTrace) {
        const paths = denomTrace.paths;
        // The previous chain id from current path.
        let chainIdBefore = chainId;
        for (const path of paths) {
          const clientState = this.queriesStore
            .get(chainIdBefore)
            .cosmos.queryIBCClientState.getClientState(
              path.portId,
              path.channelId
            );

          if (clientState.isFetching) {
            isFetching = true;
          }

          const queryChannel = this.queriesStore
            .get(chainIdBefore)
            .cosmos.queryIBCChannel.getChannel(path.portId, path.channelId);
          if (queryChannel.isFetching) {
            isFetching = true;
          }
          if (queryChannel.response) {
            path.counterpartyChannelId =
              queryChannel.response.data.channel.counterparty.channel_id;
            path.counterpartyPortId =
              queryChannel.response.data.channel.counterparty.port_id;
          }

          if (
            clientState.clientChainId &&
            this.chainStore.hasChain(clientState.clientChainId)
          ) {
            path.clientChainId = clientState.clientChainId;

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

        if (originChainInfo && !isFetching) {
          this.setCacheIBCDenomData(chainId, hash, {
            counterpartyChainId: counterpartyChainInfo?.chainId,
            denomTrace,
            originChainId: originChainInfo.chainId,
            timestamp: Date.now(),
          });
        }
      }
    }

    if (originChainInfo && denomTrace) {
      if (denomTrace.denom.split(/^(cw20):(\w+)$/).length === 4) {
        let isFetching = false;
        // If the origin currency is ics20-cw20.
        let cw20Currency = originChainInfo.currencies.find(
          (cur) =>
            denomTrace && cur.coinMinimalDenom.startsWith(denomTrace.denom)
        );
        if (
          !cw20Currency &&
          this.chainStore.hasChain(originChainInfo.chainId)
        ) {
          const originQueries = this.queriesStore.get(originChainInfo.chainId);
          if (originQueries.cosmwasm) {
            const contractAddress = denomTrace.denom.replace("cw20:", "");
            const contractInfo =
              originQueries.cosmwasm.querycw20ContractInfo.getQueryContract(
                contractAddress
              );
            isFetching = contractInfo.isFetching;
            if (contractInfo.response) {
              cw20Currency = {
                type: "cw20",
                contractAddress,
                coinDecimals: contractInfo.response.data.decimals,
                coinDenom: contractInfo.response.data.symbol,
                coinMinimalDenom: `cw20:${contractAddress}:${contractInfo.response.data.name}`,
              };
            }
          }
        }

        if (cw20Currency) {
          return {
            value: {
              coinDecimals: cw20Currency.coinDecimals,
              coinGeckoId: cw20Currency.coinGeckoId,
              coinImageUrl: cw20Currency.coinImageUrl,
              coinMinimalDenom: denomHelper.denom,
              coinDenom: this.coinDenomGenerator(
                denomTrace,
                originChainInfo,
                counterpartyChainInfo,
                cw20Currency
              ),
              paths: denomTrace.paths,
              originChainId: originChainInfo.chainId,
              originCurrency: cw20Currency,
            },
            done: fromCache && !isFetching,
          };
        }
      } else {
        const currency = originChainInfo.findCurrency(denomTrace.denom);

        if (currency && !("paths" in currency)) {
          return {
            value: {
              coinDecimals: currency.coinDecimals,
              coinGeckoId: currency.coinGeckoId,
              coinImageUrl: currency.coinImageUrl,
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
            done: (() => {
              if (
                originChainInfo.isCurrencyRegistrationInProgress(
                  currency.coinMinimalDenom
                )
              ) {
                return false;
              }

              return fromCache;
            })(),
          };
        }
      }

      // In this case, just show the raw currency.
      // But, it is possible to know the currency from query later.
      // So, let them to be observed.
      return {
        value: {
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
        done: false,
      };
    }

    return {
      value: undefined,
      done: false,
    };
  }

  protected getCacheIBCDenomData(
    chainId: string,
    denomTraceHash: string
  ): CacheIBCDenomData | undefined {
    return this.cacheDenomTracePaths.get(
      `${ChainIdHelper.parse(chainId).identifier}/${denomTraceHash}`
    );
  }

  @action
  protected setCacheIBCDenomData(
    chainId: string,
    denomTraceHash: string,
    data: CacheIBCDenomData
  ) {
    this.cacheDenomTracePaths.set(
      `${ChainIdHelper.parse(chainId).identifier}/${denomTraceHash}`,
      data
    );
  }
}
