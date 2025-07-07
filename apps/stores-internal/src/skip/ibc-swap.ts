import { HasMapStore, IChainInfoImpl } from "@keplr-wallet/stores";
import {
  AppCurrency,
  ChainInfo,
  Currency,
  ERC20Currency,
} from "@keplr-wallet/types";
import { ObservableQueryAssetsBatch } from "./assets";
import { computed, makeObservable } from "mobx";
import { ObservableQueryChains } from "./chains";
import { CoinPretty } from "@keplr-wallet/unit";
import { ObservableQueryRoute, ObservableQueryRouteInner } from "./route";
import {
  ObservableQueryMsgsDirect,
  ObservableQueryMsgsDirectInner,
} from "./msgs-direct";
import { computedFn } from "mobx-utils";
import { ObservableQueryIbcPfmTransfer } from "./ibc-pfm-transfer";
import { ObservableQueryAssetsFromSource } from "./assets-from-source";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { InternalChainStore } from "../internal";

export class ObservableQueryIBCSwapInner {
  constructor(
    protected readonly chainStore: InternalChainStore,
    protected readonly queryRoute: ObservableQueryRoute,
    protected readonly queryMsgsDirect: ObservableQueryMsgsDirect,
    public readonly amountInDenom: string,
    public readonly amountInAmount: string,
    public readonly sourceAssetChainId: string,
    public readonly destAssetDenom: string,
    public readonly destAssetChainId: string,
    public readonly affiliateFeeBps: number,
    public readonly swapVenues: {
      readonly name: string;
      readonly chainId: string;
    }[],
    public readonly allowSwaps?: boolean,
    public readonly smartSwapOptions?: {
      evmSwaps?: boolean;
      splitRoutes?: boolean;
    }
  ) {}

  getQueryMsgsDirect(
    chainIdsToAddresses: Record<string, string>,
    slippageTolerancePercent: number,
    affiliateFeeReceiver: string | undefined
  ): ObservableQueryMsgsDirectInner {
    const inAmount = new CoinPretty(
      this.chainStore
        .getChain(this.sourceAssetChainId)
        .forceFindCurrency(this.amountInDenom),
      this.amountInAmount
    );

    return this.queryMsgsDirect.getRoute(
      inAmount,
      this.sourceAssetChainId,
      this.destAssetDenom,
      this.destAssetChainId,
      chainIdsToAddresses,
      slippageTolerancePercent,
      this.affiliateFeeBps,
      affiliateFeeReceiver,
      this.swapVenues,
      this.smartSwapOptions
    );
  }

  getQueryRoute(): ObservableQueryRouteInner {
    const inAmount = new CoinPretty(
      this.chainStore
        .getChain(this.sourceAssetChainId)
        .forceFindCurrency(this.amountInDenom),
      this.amountInAmount
    );

    return this.queryRoute.getRoute(
      this.sourceAssetChainId,
      inAmount,
      this.destAssetChainId,
      this.destAssetDenom,
      this.affiliateFeeBps,
      this.swapVenues,
      this.allowSwaps,
      this.smartSwapOptions
    );
  }
}

export class ObservableQueryIbcSwap extends HasMapStore<ObservableQueryIBCSwapInner> {
  constructor(
    protected readonly chainStore: InternalChainStore,
    protected readonly assetsBatch: ObservableQueryAssetsBatch,
    protected readonly queryAssetsFromSource: ObservableQueryAssetsFromSource,
    protected readonly queryChains: ObservableQueryChains,
    protected readonly queryRoute: ObservableQueryRoute,
    protected readonly queryMsgsDirect: ObservableQueryMsgsDirect,
    protected readonly queryIBCPacketForwardingTransfer: ObservableQueryIbcPfmTransfer,
    public readonly swapVenues: {
      readonly name: string;
      readonly chainId: string;
    }[]
  ) {
    super((str) => {
      const parsed = JSON.parse(str);

      return new ObservableQueryIBCSwapInner(
        this.chainStore,
        this.queryRoute,
        this.queryMsgsDirect,
        parsed.sourceDenom,
        parsed.sourceAmount,
        parsed.sourceChainId,
        parsed.destDenom,
        parsed.destChainId,
        parsed.affiliateFeeBps,
        parsed.swapVenues,
        parsed.allowSwaps,
        parsed.smartSwapOptions
      );
    });

    makeObservable(this);
  }

  getIBCSwap(
    sourceChainId: string,
    amount: CoinPretty,
    destChainId: string,
    destDenom: string,
    affiliateFeeBps: number,
    allowSwaps?: boolean,
    smartSwapOptions?: {
      evmSwaps?: boolean;
      splitRoutes?: boolean;
    }
  ): ObservableQueryIBCSwapInner {
    const str = JSON.stringify({
      sourceChainId,
      sourceAmount: amount.toCoin().amount,
      sourceDenom: amount.currency.coinMinimalDenom,
      destChainId,
      destDenom,
      affiliateFeeBps,
      swapVenues: this.swapVenues,
      allowSwaps,
      smartSwapOptions,
    });
    return this.get(str);
  }

  isSwappableCurrency(chainId: string, currency: AppCurrency): boolean {
    if (
      chainId.startsWith("gravity-bridge-") &&
      currency.coinMinimalDenom !== "ugraviton"
    ) {
      return false;
    }
    if (
      "paths" in currency &&
      currency.originChainId &&
      currency.originCurrency
    ) {
      if (
        currency.originChainId.startsWith("gravity-bridge-") &&
        currency.originCurrency.coinMinimalDenom !== "ugraviton"
      ) {
        return false;
      }
    }
    if (!this.chainStore.isInChainInfosInListUI(chainId)) {
      return false;
    }

    if ("paths" in currency) {
      if (!currency.originChainId || !currency.originCurrency) {
        return false;
      }

      // CW20같은 얘들은 현재 처리 불가능
      if ("type" in currency.originCurrency) {
        return false;
      }

      for (const swapVenue of this.swapVenues) {
        // osmosis 위에 있는 ibc 토큰은 그냥 통과시킨다.
        if (
          ChainIdHelper.parse(chainId).identifier ===
          this.chainStore.getChain(swapVenue.chainId).chainIdentifier
        ) {
          return true;
        }

        const assetsFromSource = this.queryAssetsFromSource.getSourceAsset(
          chainId,
          currency.coinMinimalDenom
        ).assetsFromSource;

        if (!assetsFromSource) {
          return false;
        }

        const swapVenueChainId = this.chainStore.getChain(
          swapVenue.chainId
        ).chainId;

        const assets = assetsFromSource[swapVenueChainId];

        if (!assets) {
          return false;
        }

        // TODO: 미래에는 assets가 두개 이상이 될수도 있다고 한다.
        //       근데 지금은 한개로만 고정되어 있다고 한다...
        //       나중에 두개 이상의 경우가 생기면 다시 생각해보자...
        if (assets.assets.length > 0) {
          const asset = assets.assets[0];
          if (
            asset.chainId === swapVenueChainId &&
            this.chainStore.hasChain(asset.chainId) &&
            this.chainStore.hasChain(asset.originChainId)
          ) {
            const channels: {
              portId: string;
              channelId: string;

              counterpartyChainId: string;
            }[] = [];

            if (
              ChainIdHelper.parse(currency.originChainId).identifier !==
              ChainIdHelper.parse(asset.originChainId).identifier
            ) {
              return false;
            }

            const destinationCurrency = this.chainStore
              .getChain(asset.chainId)
              .findCurrencyWithoutReaction(asset.denom);

            if (!destinationCurrency) {
              return false;
            }

            if (
              currency.paths.length === 0 ||
              currency.paths.some((path) => {
                return (
                  !path.portId ||
                  !path.channelId ||
                  !path.counterpartyPortId ||
                  !path.counterpartyChannelId ||
                  !path.clientChainId ||
                  !this.chainStore.hasChain(path.clientChainId)
                );
              })
            ) {
              return false;
            }

            const lastPath = currency.paths[currency.paths.length - 1];
            if (
              !lastPath.clientChainId ||
              ChainIdHelper.parse(lastPath.clientChainId).identifier !==
                ChainIdHelper.parse(asset.originChainId).identifier
            ) {
              return false;
            }

            // Path to the origin chain
            channels.push(
              ...currency.paths.map((path) => {
                return {
                  portId: path.portId!,
                  channelId: path.channelId!,
                  counterpartyChainId: path.clientChainId!,
                };
              })
            );

            if ("paths" in destinationCurrency) {
              if (
                !destinationCurrency.originChainId ||
                !destinationCurrency.originCurrency ||
                !this.chainStore.hasChain(destinationCurrency.originChainId)
              ) {
                return false;
              }

              if (
                ChainIdHelper.parse(destinationCurrency.originChainId)
                  .identifier !==
                ChainIdHelper.parse(asset.originChainId).identifier
              ) {
                return false;
              }

              if (
                destinationCurrency.paths.length === 0 ||
                destinationCurrency.paths.some((path) => {
                  return (
                    !path.portId ||
                    !path.channelId ||
                    !path.counterpartyPortId ||
                    !path.counterpartyChannelId ||
                    !path.clientChainId ||
                    !this.chainStore.hasChain(path.clientChainId)
                  );
                })
              ) {
                return false;
              }

              const reversedPaths = destinationCurrency.paths.slice().reverse();
              for (let i = 0; i < reversedPaths.length; i++) {
                const reversedPath = reversedPaths[i];
                channels.push({
                  portId: reversedPath.counterpartyPortId!,
                  channelId: reversedPath.counterpartyChannelId!,
                  counterpartyChainId:
                    reversedPaths.length > i + 1
                      ? reversedPaths[i + 1].clientChainId!
                      : asset.chainId,
                });
              }
            }

            let pfmPossibility = true;
            if (channels.length > 0) {
              // Only push if it is possible to transfer via packet forwarding.
              // (If channel is only one, no need to check packet forwarding because it is direct transfer)
              if (channels.length > 1) {
                if (
                  !this.chainStore.getChain(chainId).hasFeature("ibc-go") ||
                  !this.queryChains.isSupportsMemo(chainId)
                ) {
                  pfmPossibility = false;
                }

                if (pfmPossibility) {
                  for (let i = 0; i < channels.length - 1; i++) {
                    const channel = channels[i];
                    if (
                      !this.chainStore
                        .getChain(channel.counterpartyChainId)
                        .hasFeature("ibc-go") ||
                      !this.queryChains.isSupportsMemo(
                        channel.counterpartyChainId
                      ) ||
                      !this.queryChains.isPFMEnabled(
                        channel.counterpartyChainId
                      ) ||
                      !this.chainStore
                        .getChain(channel.counterpartyChainId)
                        .hasFeature("ibc-pfm")
                    ) {
                      pfmPossibility = false;
                      break;
                    }
                  }
                }
              }

              if (pfmPossibility) {
                return true;
              }
            }
          }
        }
      }
    } else {
      if ("type" in currency) {
        switch (currency.type) {
          case "erc20":
            return this.queryChains.isChainTypeEVM(chainId);
          // 현재 CW20같은 얘들은 처리할 수 없다.
          default:
            return false;
        }
      } else {
        return (
          this.queryChains.isChainTypeEVM(chainId) ||
          this.queryChains.isSupportsMemo(chainId)
        );
      }
    }
    return false;
  }

  @computed
  get swapDestinationCurrenciesMap(): Map<
    string,
    {
      chainInfo: IChainInfoImpl;
      currencies: Currency[];
    }
  > {
    // Key is chain identifier
    const res = new Map<
      string,
      {
        chainInfo: IChainInfoImpl;
        currencies: Currency[];
      }
    >();

    const swapVenueChainIds = this.swapVenues.map((v) => v.chainId).sort();
    const assetsBatch =
      this.assetsBatch.findCachedAssetsBatch(swapVenueChainIds);

    if (assetsBatch.size === 0) {
      return res;
    }

    const getMapEntry = (chainId: string) => {
      const chainIdentifier = this.chainStore.getChain(chainId).chainIdentifier;
      if (!res.has(chainIdentifier)) {
        res.set(chainIdentifier, {
          chainInfo: this.chainStore.getChain(chainId),
          currencies: [],
        });
      }
      return res.get(chainIdentifier)!;
    };

    for (const chainId of swapVenueChainIds) {
      const assets = assetsBatch.get(chainId) ?? [];
      if (assets.length === 0) continue;

      // Process each asset
      for (const asset of assets) {
        // Skip CW20 and SVM assets
        if (asset.isCw20 || asset.isSvm) {
          continue;
        }

        // Skip multi-hop IBC currencies (handled by getSwapDestinationCurrencyAlternativeChains)
        const traceParts = asset.trace.split("/");
        if (traceParts.length > 2) {
          continue;
        }

        // Skip assets from chains not in the UI list
        if (!this.chainStore.isInChainInfosInListUI(asset.originChainId)) {
          continue;
        }

        // IBC currency인 경우
        if (asset.denom.startsWith("ibc/")) {
          const originCurrency = {
            coinDecimals: asset.decimals,
            coinMinimalDenom: asset.originDenom,
            coinDenom: asset.recommendedSymbol ?? asset.symbol,
            coinGeckoId: asset.coingeckoId,
            coinImageUrl: asset.logoURI,
          };

          const originChainEntry = getMapEntry(asset.originChainId);
          if (
            !originChainEntry.currencies.some(
              (c) => c.coinMinimalDenom === originCurrency.coinMinimalDenom
            )
          ) {
            originChainEntry.currencies.push(originCurrency);
          }
          continue;
        }

        const entry = getMapEntry(asset.chainId);
        const currency = {
          coinDecimals: asset.decimals,
          coinMinimalDenom: asset.denom,
          coinDenom: asset.recommendedSymbol ?? asset.symbol,
          coinGeckoId: asset.coingeckoId,
          coinImageUrl: asset.logoURI,
        };

        if (asset.isEvm && asset.tokenContract) {
          const erc20Currency: ERC20Currency = {
            ...currency,
            type: "erc20" as const,
            contractAddress: asset.tokenContract,
          };

          if (
            !entry.currencies.some(
              (c) => c.coinMinimalDenom === erc20Currency.coinMinimalDenom
            )
          ) {
            entry.currencies.push(erc20Currency);
          }
          continue;
        }

        if (
          !entry.currencies.some(
            (c) => c.coinMinimalDenom === currency.coinMinimalDenom
          )
        ) {
          entry.currencies.push(currency);
        }
      }
    }

    return res;
  }

  get isLoadingSwapDestinationCurrenciesMap(): boolean {
    const swapVenueChainIds = this.swapVenues.map((v) => v.chainId).sort();
    const assetBatchCache =
      this.assetsBatch.findCachedAssetsBatch(swapVenueChainIds);
    const assetsBatch = this.assetsBatch.getAssetsBatch(swapVenueChainIds);

    return assetBatchCache.size === 0 && assetsBatch.isFetching;
  }

  @computed
  get swapDestinationCurrencies(): {
    chainInfo: IChainInfoImpl;
    currencies: Currency[];
  }[] {
    return Array.from(this.swapDestinationCurrenciesMap.values());
  }

  isSwapDestinationOrAlternatives = computedFn(
    (chainId: string, currency: AppCurrency): boolean => {
      if (
        this.swapDestinationCurrenciesMap
          .get(this.chainStore.getChain(chainId).chainIdentifier)
          ?.currencies.find(
            (c) => c.coinMinimalDenom === currency.coinMinimalDenom
          )
      ) {
        return true;
      }

      if ("paths" in currency) {
        // IBC currency인데 origin에 대한 정보가 없다면 처리할 수 없다.
        if (!currency.originChainId || !currency.originCurrency) {
          return false;
        }

        if (currency.originCurrency.coinMinimalDenom.startsWith("erc20:")) {
          const nativeCurrency = this.chainStore
            .getChain(currency.originChainId)
            .currencies.find((cur) => cur.coinMinimalDenom.endsWith("-native"));
          if (nativeCurrency) {
            const bridges = this.queryIBCPacketForwardingTransfer.getBridges(
              currency.originChainId,
              currency.originCurrency.coinMinimalDenom.toLowerCase() ===
                "erc20:0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
                ? nativeCurrency.coinMinimalDenom
                : currency.originCurrency.coinMinimalDenom
            );
            for (const bridge of bridges) {
              if (
                ChainIdHelper.parse(bridge.destinationChainId).identifier ===
                  ChainIdHelper.parse(chainId).identifier &&
                bridge.denom === currency.coinMinimalDenom
              ) {
                return true;
              }
            }
          }
        } else {
          const originOutChainId = currency.originChainId;
          const originOutCurrency = currency.originCurrency;

          const channels = this.queryIBCPacketForwardingTransfer.getIBCChannels(
            originOutChainId,
            originOutCurrency.coinMinimalDenom
          );

          // 다른 후보들은 사실 ibc pfm transfer가 가능한 채널 정보와 로직이 유사하다.
          // 차이점은 ibc pfm transfer의 경우는 시작지점이 tx를 보내는 체인이지만
          // ibc swap의 경우는 이렇게 처리할 수 없다. (일단 기본적으로 무조건 osmosis를 거치기 때문에)
          // ibc pfm transfer의 경우 시작 지점을 보내는 체인의 경우 ibc module의 memo만 지원하면
          // 두번째 체인부터 pfm을 지원하면 되기 때문에 보내는 체인의 경우는 이러한 확인을 하지 않는다.
          // 하지만 ibc swap의 경우는 ibc pfm transfer 상의 보내는 체인은 시작 지점이 될 수 없기 때문에 pfm에 대한 확인을 꼭 해야한다.
          if (
            !this.chainStore.getChain(originOutChainId).hasFeature("ibc-go") ||
            !this.queryChains.isSupportsMemo(originOutChainId) ||
            !this.queryChains.isPFMEnabled(originOutChainId) ||
            !this.chainStore.getChain(originOutChainId).hasFeature("ibc-pfm")
          ) {
            // 만약 originOutChainId가 ibc-pfm을 지원하지 않는다면
            // 여기서 더 routing할 방법은 없다.
            // osmosis의 경우는 ibc transfer가 아니라 그대로 osmosis에서 남기 때문에
            // 따로 추가해주고 반환한다.
            const findSwapVenue = channels.find(
              (channel) =>
                channel.channels.length === 1 &&
                this.swapVenues.some(
                  (swapVenue) =>
                    this.chainStore.getChain(swapVenue.chainId)
                      .chainIdentifier ===
                    this.chainStore.getChain(
                      channel.channels[0].counterpartyChainId
                    ).chainIdentifier
                )
            );
            if (findSwapVenue) {
              return true;
            }
          }

          for (const channel of channels) {
            if (
              channel.destinationChainId ===
                this.chainStore.getChain(chainId).chainId &&
              channel.denom === currency.coinMinimalDenom
            ) {
              return true;
            }
          }
        }
      } else {
        return this.queryChains.isChainTypeEVM(chainId);
      }

      return false;
    }
  );

  getSwapDestinationCurrencyAlternativeChains = computedFn(
    (
      chainInfo: IChainInfoImpl,
      currency: AppCurrency
    ): { denom: string; chainId: string }[] => {
      if (
        "paths" in currency &&
        (!currency.originChainId || !currency.originCurrency)
      ) {
        // IBC currency인데 origin에 대한 정보가 없다면 처리할 수 없다.
        // 사실상 오류 케이스인데 어케 처리할 지 난해하기 때문에 일단 빈 배열을 반환.
        return [];
      }

      const originOutChainId = (() => {
        if ("originChainId" in currency && currency.originChainId) {
          return currency.originChainId;
        }
        return chainInfo.chainId;
      })();
      const originOutCurrency = (() => {
        if ("originCurrency" in currency && currency.originCurrency) {
          return currency.originCurrency;
        }
        return currency;
      })();

      const chainIdsToEnsure = new Set<string>([chainInfo.chainId]);
      if (originOutChainId !== chainInfo.chainId) {
        chainIdsToEnsure.add(originOutChainId);
      }

      const candidateChains: IChainInfoImpl<ChainInfo>[] = [];

      // 밑에서 따로 IBC 경로에 대한 처리를 하기 때문에 여기선 EVM 체인이 포함된 경우만 다룬다.
      for (const chain of this.queryChains.chains) {
        const isSameChain = chain.chainInfo.chainId === chainInfo.chainId;
        const containsEVMOnlyChain =
          chain.chainInfo.chainId.startsWith("eip155:") ||
          chainInfo.chainId.startsWith("eip155:");
        const isCandidateChain = !isSameChain && containsEVMOnlyChain;
        if (isCandidateChain) {
          candidateChains.push(chain.chainInfo);
          chainIdsToEnsure.add(chain.chainInfo.chainId);
        }
      }

      const res: { denom: string; chainId: string }[] =
        !this.chainStore.isInChainInfosInListUI(originOutChainId)
          ? []
          : [
              {
                // 기본적으로 origin에 대한 정보를 넣어준다.
                chainId: originOutChainId,
                denom: originOutCurrency.coinMinimalDenom,
              },
            ];

      const assetsBatch = this.assetsBatch.findCachedAssetsBatch(
        Array.from(chainIdsToEnsure)
      );

      const asset = assetsBatch
        .get(chainInfo.chainId)
        ?.find((asset) => asset.denom === currency.coinMinimalDenom);
      for (const candidateChain of candidateChains) {
        // Skip에서 내려주는 응답에서 recommended symbol 혹은 origin denom과 origin chain id가 같다면 해당 토큰의 도착 체인 후보가 될 수 있는 걸로 간주한다.
        const candidateAsset = assetsBatch
          .get(candidateChain.chainId)
          ?.find(
            (a) =>
              a.recommendedSymbol === asset?.recommendedSymbol ||
              (a.originDenom === asset?.originDenom &&
                a.originChainId === asset?.originChainId)
          );

        if (candidateAsset) {
          const currencyFound = candidateChain.findCurrencyWithoutReaction(
            candidateAsset.denom
          );

          if (currencyFound) {
            res.push({
              denom: candidateAsset.denom,
              chainId: candidateChain.chainId,
            });
          }
        }
      }

      const channels = this.queryIBCPacketForwardingTransfer.getIBCChannels(
        originOutChainId,
        originOutCurrency.coinMinimalDenom
      );
      // 다른 후보들은 사실 ibc pfm transfer가 가능한 채널 정보와 로직이 유사하다.
      // 차이점은 ibc pfm transfer의 경우는 시작지점이 tx를 보내는 체인이지만
      // ibc swap의 경우는 이렇게 처리할 수 없다. (일단 기본적으로 무조건 osmosis를 거치기 때문에)
      // ibc pfm transfer의 경우 시작 지점을 보내는 체인의 경우 ibc module의 memo만 지원하면
      // 두번째 체인부터 pfm을 지원하면 되기 때문에 보내는 체인의 경우는 이러한 확인을 하지 않는다.
      // 하지만 ibc swap의 경우는 ibc pfm transfer 상의 보내는 체인은 시작 지점이 될 수 없기 때문에 pfm에 대한 확인을 꼭 해야한다.
      if (
        !this.chainStore.getChain(originOutChainId).hasFeature("ibc-go") ||
        !this.queryChains.isSupportsMemo(originOutChainId) ||
        !this.queryChains.isPFMEnabled(originOutChainId) ||
        !this.chainStore.getChain(originOutChainId).hasFeature("ibc-pfm")
      ) {
        // 만약 originOutChainId가 ibc-pfm을 지원하지 않는다면
        // 여기서 더 routing할 방법은 없다.
        // osmosis의 경우는 ibc transfer가 아니라 그대로 osmosis에서 남기 때문에
        // 따로 추가해주고 반환한다.
        const findSwapVenue = channels.find(
          (channel) =>
            channel.channels.length === 1 &&
            this.swapVenues.some(
              (swapVenue) =>
                this.chainStore.getChain(swapVenue.chainId).chainIdentifier ===
                this.chainStore.getChain(
                  channel.channels[0].counterpartyChainId
                ).chainIdentifier
            )
        );
        if (findSwapVenue) {
          res.push({
            denom: findSwapVenue.denom,
            chainId: findSwapVenue.destinationChainId,
          });
        }
        return res;
      }
      for (const channel of channels) {
        if (channel.channels.length > 0) {
          res.push({
            denom: channel.denom,
            chainId: channel.destinationChainId,
          });
        }
      }

      return res.filter(({ chainId }) => {
        return this.chainStore.isInChainInfosInListUI(chainId);
      });
    }
  );
}
