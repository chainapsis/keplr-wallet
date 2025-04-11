import { makeObservable, observable, runInAction } from "mobx";
import { AppCurrency, ChainInfo, ERC20Currency } from "@keplr-wallet/types";
import {
  IChainInfoImpl,
  ChainStore,
  CosmosQueries,
  CosmwasmQueries,
  IQueriesStore,
  SecretQueries,
} from "@keplr-wallet/stores";
import { DenomHelper, KVStore } from "@keplr-wallet/common";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { EthereumQueries } from "@keplr-wallet/stores-eth";

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
  originChainUnknown: boolean;
  counterpartyChainId: string | undefined;
  counterpartyChainUnknown: boolean;
  timestamp: number;
};

type CacheTokenInfo =
  | {
      notFound: undefined;
      coinDenom: string;
      coinDecimals: number;
      coinGeckoId: string | undefined;
      coinImageUrl: string | undefined;
      timestamp: number;
    }
  | {
      notFound: true;
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

  protected cacheDenomTracePaths: Map<string, CacheIBCDenomData> = new Map();
  protected cacheTokenInfoMetadata: Map<string, CacheTokenInfo> = new Map();

  @observable
  public isInitialized = false;

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly cacheDuration: number = 24 * 3600 * 1000, // 1 days
    protected readonly failedCacheDuration: number = 1 * 3600 * 1000, // 1 hours
    protected readonly chainStore: ChainStore,
    protected readonly accountStore: {
      hasAccount(chainId: string): boolean;
      getAccount(chainId: string): {
        bech32Address: string;
      };
    },
    protected readonly queriesStore: IQueriesStore<
      CosmosQueries &
        Partial<CosmwasmQueries> &
        Partial<SecretQueries> &
        Partial<EthereumQueries>
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
    // "cache-ibc-denom-trace-paths" and "cache-ibc-denom-trace-paths-v3" is already used.
    // v2: Add "clientChainId", "counterpartyPortId", "counterpartyChannelId" fields to the paths.
    // v3: raw response의 값들을 저장하도록 수정
    {
      const key = `cache-ibc-denom-trace-paths-v3`;
      const saved = await this.kvStore.get<Record<string, CacheIBCDenomData>>(
        key
      );
      if (saved) {
        for (const [key, value] of Object.entries(saved)) {
          if (Date.now() - value.timestamp < this.cacheDuration) {
            this.cacheDenomTracePaths.set(key, value);
          }
        }
      }
    }

    {
      const key = `cache-token-info`;
      const saved = await this.kvStore.get<Record<string, CacheTokenInfo>>(key);
      if (saved) {
        for (const [key, value] of Object.entries(saved)) {
          if (Date.now() - value.timestamp < this.cacheDuration) {
            this.cacheTokenInfoMetadata.set(key, value);
          }
        }
      }
    }

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

    let isGlobalFetching = false;
    let fromCache = false;
    let cached = this.getCacheIBCDenomData(chainId, hash);
    if (cached) {
      if (
        !cached.denomTrace.paths.some((path) => {
          if (!path.clientChainId) {
            return true;
          }
          return !this.chainStore.hasChain(path.clientChainId);
        })
      ) {
        fromCache = true;
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

        // 만약 이전의 cache에서 originChainId와 counterpartyChainId를 몰랐던 상태였는데
        // 현재는 알게된 경우에는 cache를 사용하지않고 지운다.
        if (originChainInfo && cached.originChainUnknown) {
          cached = undefined;
          fromCache = false;
          this.removeCacheIBCDenomData(chainId, hash);
        }
        if (counterpartyChainInfo && cached?.counterpartyChainUnknown) {
          cached = undefined;
          fromCache = false;
          this.removeCacheIBCDenomData(chainId, hash);
        }
      } else {
        // If cache has unresolved paths, do nothing.
        return {
          value: undefined,
          done: true,
        };
      }
    }

    if (!fromCache) {
      let isFetching = false;

      const queryDenomTrace =
        queries.cosmos.queryIBCDenomTrace.getDenomTrace(hash);
      denomTrace = queryDenomTrace.denomTrace;

      if (queryDenomTrace.isFetching) {
        isFetching = true;
      }

      if (denomTrace) {
        let rawOriginChainId: string | undefined = undefined;
        let rawCounterpartyChainId: string | undefined = undefined;

        const paths = denomTrace.paths;
        // The previous chain id from current path.
        let chainIdBefore = chainId;
        for (let i = 0; i < paths.length; i++) {
          const path = paths[i];
          const isLast = i === paths.length - 1;
          if (
            // 현재 ethereum ibc의 경우 ethereum까지 타고 들어가서 nested하게 처리할 방법은 없다.
            // 마지막 path일 경우만 처리한다.
            isLast &&
            this.chainStore.getChain(chainIdBefore).hasFeature("ibc-v2") &&
            denomTrace.denom.startsWith("0x")
          ) {
            const clientState = this.queriesStore
              .get(chainIdBefore)
              .cosmos.queryIBCClientStateV2.getClientState(path.channelId);
            if (clientState.isFetching) {
              isFetching = true;
            }
            if (
              clientState.clientChainId &&
              !Number.isNaN(parseInt(clientState.clientChainId))
            ) {
              const ethereumChainId = `eip155:${clientState.clientChainId}`;
              rawOriginChainId = ethereumChainId;
              if (!rawCounterpartyChainId) {
                rawCounterpartyChainId = ethereumChainId;
              }
              if (this.chainStore.hasChain(ethereumChainId)) {
                // TODO: counterparty channel id를 구해야할듯한데
                //       https://github.com/cosmos/ibc-go/blob/a8b4af9c757f5235a965718597f73f039c4a5708/proto/ibc/core/client/v2/query.proto#L15
                //       이것으로 추정되지만 현재 cosmos testnet에서 해당 쿼리가 501 not implemented로 반환되기 때문에 일단 패스...

                path.clientChainId = ethereumChainId;

                chainIdBefore = ethereumChainId;
                originChainInfo = this.chainStore.getChain(ethereumChainId);
                if (!counterpartyChainInfo) {
                  counterpartyChainInfo =
                    this.chainStore.getChain(ethereumChainId);
                }
              } else {
                originChainInfo = undefined;
                rawOriginChainId = undefined;
              }
              break;
            }
          }

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

          if (clientState.clientChainId) {
            rawOriginChainId = clientState.clientChainId;
            if (!rawCounterpartyChainId) {
              rawCounterpartyChainId = clientState.clientChainId;
            }
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
            rawOriginChainId = undefined;
            break;
          }
        }

        if (isFetching) {
          isGlobalFetching = true;
        }
        if (!isFetching) {
          this.setCacheIBCDenomData(chainId, hash, {
            denomTrace,
            originChainId: rawOriginChainId,
            originChainUnknown: !originChainInfo,
            counterpartyChainId: rawCounterpartyChainId,
            counterpartyChainUnknown: !counterpartyChainInfo,
            timestamp: Date.now(),
          });
        }
      }
    }

    if (originChainInfo && denomTrace) {
      // 이 경우 ethereum 계열이기 때문에 다르게 처리해야한다.
      if (this.chainStore.isEvmOnlyChain(originChainInfo.chainId)) {
        // 유저가 Add Token을 통해서 추가했을 경우
        const currency = originChainInfo.currencies.find((cur) => {
          return cur.coinMinimalDenom === `erc20:${denomTrace!.denom}`;
        });
        if (currency) {
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
            done: true,
          };
        }

        const erc20CurrencyRes = this.getERC20TokenInfo(
          originChainInfo.chainId,
          denomTrace.denom
        );
        if (erc20CurrencyRes.isFetching) {
          isGlobalFetching = true;
        }
        const erc20Currency: ERC20Currency | undefined = erc20CurrencyRes.res
          ? {
              type: "erc20",
              coinMinimalDenom: `erc20:${denomTrace!.denom}`,
              contractAddress: denomTrace.denom,
              coinDenom: erc20CurrencyRes.res.coinDenom,
              coinDecimals: erc20CurrencyRes.res.decimals,
              coinGeckoId: erc20CurrencyRes.res.coingeckoId,
              coinImageUrl: erc20CurrencyRes.res.coinImageUrl,
            }
          : undefined;
        if (!erc20CurrencyRes.isFetching && !erc20CurrencyRes.fromCache) {
          if (erc20Currency) {
            this.setCacheTokenInfo(originChainInfo.chainId, denomTrace.denom, {
              notFound: undefined,
              coinDenom: erc20Currency.coinDenom,
              coinDecimals: erc20Currency.coinDecimals,
              coinGeckoId: erc20Currency.coinGeckoId,
              coinImageUrl: erc20Currency.coinImageUrl,
              timestamp: Date.now(),
            });
          } else if (erc20CurrencyRes.notFound) {
            this.setCacheTokenInfo(originChainInfo.chainId, denomTrace.denom, {
              notFound: true,
              timestamp: Date.now(),
            });
          }
        }
        if (erc20Currency) {
          return {
            value: {
              coinDecimals: erc20Currency.coinDecimals,
              coinGeckoId: erc20Currency.coinGeckoId,
              coinImageUrl: erc20Currency.coinImageUrl,
              coinMinimalDenom: denomHelper.denom,
              coinDenom: this.coinDenomGenerator(
                denomTrace,
                originChainInfo,
                counterpartyChainInfo,
                erc20Currency
              ),
              paths: denomTrace.paths,
              originChainId: originChainInfo.chainId,
              originCurrency: erc20Currency,
            },
            done: !isGlobalFetching,
          };
        } else {
          return {
            value: undefined,
            done: !isGlobalFetching,
          };
        }
      } else {
        const isCW20Currency =
          denomTrace.denom.split(/^(cw20):(\w+)$/).length === 4;
        const isERC20Currency =
          denomTrace.denom.split(/^(erc20)\/(\w+)$/).length === 4;
        switch (true) {
          case isCW20Currency:
            const isSecret20Currency =
              originChainInfo.features?.includes("secretwasm");

            if (!isSecret20Currency) {
              let isFetching = false;
              // If the origin currency is ics20-cw20.
              let cw20Currency = originChainInfo.currencies.find(
                (cur) =>
                  denomTrace &&
                  cur.coinMinimalDenom.startsWith(denomTrace.denom)
              );
              if (
                !cw20Currency &&
                this.chainStore.hasChain(originChainInfo.chainId)
              ) {
                const originQueries = this.queriesStore.get(
                  originChainInfo.chainId
                );
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
              let isSecret20Fetching = false;
              // If the origin currency is ics20-cw20.
              let secret20Currency = originChainInfo.currencies.find(
                (cur) =>
                  denomTrace &&
                  cur.coinMinimalDenom.startsWith(denomTrace.denom)
              );
              if (
                !secret20Currency &&
                this.chainStore.hasChain(originChainInfo.chainId)
              ) {
                const originQueries = this.queriesStore.get(
                  originChainInfo.chainId
                );
                if (originQueries.secret) {
                  const contractAddress = denomTrace.denom.replace("cw20:", "");
                  const contractInfo =
                    originQueries.secret.querySecret20ContractInfo.getQueryContract(
                      contractAddress
                    );
                  isSecret20Fetching = contractInfo.isFetching;
                  if (contractInfo.response) {
                    secret20Currency = {
                      type: "secret20",
                      contractAddress,
                      coinDecimals:
                        contractInfo.response.data.token_info.decimals,
                      coinDenom: contractInfo.response.data.token_info.symbol,
                      coinMinimalDenom: `secret20:${contractAddress}:${contractInfo.response.data.token_info.name}`,
                    };
                  }
                }
              }

              if (secret20Currency) {
                return {
                  value: {
                    coinDecimals: secret20Currency.coinDecimals,
                    coinGeckoId: secret20Currency.coinGeckoId,
                    coinImageUrl: secret20Currency.coinImageUrl,
                    coinMinimalDenom: denomHelper.denom,
                    coinDenom: this.coinDenomGenerator(
                      denomTrace,
                      originChainInfo,
                      counterpartyChainInfo,
                      secret20Currency
                    ),
                    paths: denomTrace.paths,
                    originChainId: originChainInfo.chainId,
                    originCurrency: secret20Currency,
                  },
                  done: fromCache && !isSecret20Fetching,
                };
              }
            }
            break;
          case isERC20Currency:
            let isERC20Fetching = false;
            // If the origin currency is ics20-erc20.
            let erc20Currency = originChainInfo.currencies.find(
              (cur) =>
                denomTrace && cur.coinMinimalDenom.startsWith(denomTrace.denom)
            );
            if (
              !erc20Currency &&
              this.chainStore.hasChain(originChainInfo.chainId)
            ) {
              const originQueries = this.queriesStore.get(
                originChainInfo.chainId
              );
              if (originQueries.ethereum) {
                const contractAddress = denomTrace.denom.replace("erc20/", "");
                const contractInfo =
                  originQueries.ethereum.queryEthereumERC20ContractInfo.getQueryContract(
                    contractAddress
                  );
                isERC20Fetching = contractInfo.isFetching;
                if (contractInfo.tokenInfo) {
                  erc20Currency = {
                    type: "erc20",
                    contractAddress,
                    coinDecimals: contractInfo.tokenInfo.decimals,
                    coinDenom: contractInfo.tokenInfo.symbol,
                    coinMinimalDenom: `erc20:${contractAddress}`,
                  };
                }
              }
            }

            if (erc20Currency) {
              return {
                value: {
                  coinDecimals: erc20Currency.coinDecimals,
                  coinGeckoId: erc20Currency.coinGeckoId,
                  coinImageUrl: erc20Currency.coinImageUrl,
                  coinMinimalDenom: denomHelper.denom,
                  coinDenom: this.coinDenomGenerator(
                    denomTrace,
                    originChainInfo,
                    counterpartyChainInfo,
                    erc20Currency
                  ),
                  paths: denomTrace.paths,
                  originChainId: originChainInfo.chainId,
                  originCurrency: erc20Currency,
                },
                done: fromCache && !isERC20Fetching,
              };
            }
            break;
          default:
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
            break;
        }

        // In this case, just not show the currency.
        // But, it is possible to know the currency from query later.
        // So, let them to be observed.
        return {
          value: undefined,
          done: false,
        };
      }
    }

    return {
      value: undefined,
      done: false,
    };
  }

  protected getERC20TokenInfo(
    chainId: string,
    coinMinimalDenom: string
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
    const cached = this.getCacheTokenInfo(chainId, coinMinimalDenom);
    if (cached) {
      if (cached.notFound) {
        return {
          res: undefined,
          isFetching: false,
          fromCache: true,
          notFound: true,
        };
      }
      return {
        res: {
          coinDenom: cached.coinDenom,
          decimals: cached.coinDecimals,
          coingeckoId: cached.coinGeckoId,
          coinImageUrl: cached.coinImageUrl,
        },
        isFetching: false,
        fromCache: true,
        notFound: false,
      };
    }

    const queries = this.queriesStore.get(chainId);
    if (chainId === "eip155:1") {
      // XXX: 바빌론 측의 요청으로 밑의 컨트랙트는 일단 하드코딩
      //      밑의 컨트랙트는 코인겍코에 없어서 불러올 수 없음.
      //      0xf6718b2701d4a6498ef77d7c152b2137ab28b8a3
      //      0x09def5abc67e967d54e8233a4b5ebbc1b3fbe34b
      //      밑의 얘도 존재하는데 얘는 이더스캔에도 안떠서 일단 패스
      //      0x9356f6d95b8e109f4b7ce3e49d672967d3b48383
      // if (coinMinimalDenom === "0xf6718b2701d4a6498ef77d7c152b2137ab28b8a3") {
      //   return {
      //     res: {
      //       coinDenom: "stBTC",
      //       decimals: 18,
      //       coingeckoId: undefined,
      //       coinImageUrl: undefined,
      //     },
      //     isFetching: false,
      //     fromCache: false,
      //   };
      // }
      // if (coinMinimalDenom === "0x09def5abc67e967d54e8233a4b5ebbc1b3fbe34b") {
      //   return {
      //     res: {
      //       coinDenom: "waBTC",
      //       decimals: 18,
      //       coingeckoId: undefined,
      //       coinImageUrl: undefined,
      //     },
      //     isFetching: false,
      //     fromCache: false,
      //   };
      // }
    }

    if (queries.ethereum) {
      const contractInfo =
        queries.ethereum.queryEthereumCoingeckoTokenInfo.getQueryContract(
          coinMinimalDenom
        );
      if (contractInfo) {
        const isFetching = contractInfo.isFetching;
        if (contractInfo.symbol != null && contractInfo.decimals != null) {
          return {
            res: {
              coinDenom: contractInfo.symbol,
              decimals: contractInfo.decimals,
              coingeckoId: contractInfo.coingeckoId,
              coinImageUrl: contractInfo.logoURI,
            },
            isFetching,
            fromCache: false,
            notFound: false,
          };
        } else {
          return {
            res: undefined,
            isFetching,
            fromCache: false,
            notFound: contractInfo?.error?.status === 404,
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
    } else {
      return {
        res: undefined,
        isFetching: false,
        fromCache: false,
        notFound: false,
      };
    }
  }

  protected getCacheIBCDenomData(
    chainId: string,
    denomTraceHash: string
  ): CacheIBCDenomData | undefined {
    let res = this.cacheDenomTracePaths.get(
      `${ChainIdHelper.parse(chainId).identifier}/${denomTraceHash}`
    );

    if (res) {
      if (Date.now() - res.timestamp > this.cacheDuration) {
        this.cacheDenomTracePaths.delete(
          `${ChainIdHelper.parse(chainId).identifier}/${denomTraceHash}`
        );
        const key = `cache-ibc-denom-trace-paths-v3`;
        const obj = Object.fromEntries(this.cacheDenomTracePaths);
        this.kvStore.set<Record<string, CacheIBCDenomData>>(key, obj);
        res = undefined;
      }
    }

    return res;
  }

  protected setCacheIBCDenomData(
    chainId: string,
    denomTraceHash: string,
    data: CacheIBCDenomData
  ) {
    this.cacheDenomTracePaths.set(
      `${ChainIdHelper.parse(chainId).identifier}/${denomTraceHash}`,
      data
    );
    const key = `cache-ibc-denom-trace-paths-v3`;
    const obj = Object.fromEntries(this.cacheDenomTracePaths);
    this.kvStore.set<Record<string, CacheIBCDenomData>>(key, obj);
  }

  protected removeCacheIBCDenomData(chainId: string, denomTraceHash: string) {
    this.cacheDenomTracePaths.delete(
      `${ChainIdHelper.parse(chainId).identifier}/${denomTraceHash}`
    );
    const key = `cache-ibc-denom-trace-paths-v3`;
    const obj = Object.fromEntries(this.cacheDenomTracePaths);
    this.kvStore.set<Record<string, CacheIBCDenomData>>(key, obj);
  }

  protected getCacheTokenInfo(
    chainId: string,
    coinMinimalDenom: string
  ): CacheTokenInfo | undefined {
    let res = this.cacheTokenInfoMetadata.get(
      `${ChainIdHelper.parse(chainId).identifier}/${coinMinimalDenom}`
    );

    if (res) {
      if (res.notFound) {
        if (Date.now() - res.timestamp > this.failedCacheDuration) {
          this.cacheTokenInfoMetadata.delete(
            `${ChainIdHelper.parse(chainId).identifier}/${coinMinimalDenom}`
          );
          const key = `cache-token-info`;
          const obj = Object.fromEntries(this.cacheTokenInfoMetadata);
          this.kvStore.set<Record<string, CacheTokenInfo>>(key, obj);
          res = undefined;
        }
      } else if (Date.now() - res.timestamp > this.cacheDuration) {
        this.cacheTokenInfoMetadata.delete(
          `${ChainIdHelper.parse(chainId).identifier}/${coinMinimalDenom}`
        );
        const key = `cache-token-info`;
        const obj = Object.fromEntries(this.cacheTokenInfoMetadata);
        this.kvStore.set<Record<string, CacheTokenInfo>>(key, obj);
        res = undefined;
      }
    }

    return res;
  }

  protected setCacheTokenInfo(
    chainId: string,
    coinMinimalDenom: string,
    data: CacheTokenInfo
  ) {
    this.cacheTokenInfoMetadata.set(
      `${ChainIdHelper.parse(chainId).identifier}/${coinMinimalDenom}`,
      data
    );
    const key = `cache-token-info`;
    const obj = Object.fromEntries(this.cacheTokenInfoMetadata);
    this.kvStore.set<Record<string, CacheTokenInfo>>(key, obj);
  }
}
