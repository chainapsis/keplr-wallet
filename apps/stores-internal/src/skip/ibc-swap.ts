import { HasMapStore, IChainInfoImpl } from "@keplr-wallet/stores";
import { AppCurrency, Currency, ERC20Currency } from "@keplr-wallet/types";
import { ObservableQueryAssets } from "./assets";
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
    protected readonly queryAssets: ObservableQueryAssets,
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

  // Key is chain identifier
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

    const isMobile = "ReactNativeWebView" in window;

    for (const swapVenue of this.swapVenues) {
      const swapChainInfo = this.chainStore.getChain(swapVenue.chainId);

      const queryAssets = this.queryAssets.getAssets(swapChainInfo.chainId);
      const assets = isMobile
        ? queryAssets.assetsOnlySwapUsages
        : queryAssets.assets;

      const getMap = (chainId: string) => {
        const chainIdentifier =
          this.chainStore.getChain(chainId).chainIdentifier;
        let inner = res.get(chainIdentifier);
        if (!inner) {
          inner = {
            chainInfo: this.chainStore.getChain(chainId),
            currencies: [],
          };
          res.set(chainIdentifier, inner);
        }

        return inner;
      };

      for (const asset of assets) {
        const chainId = asset.chainId;

        const currency = this.chainStore
          .getChain(chainId)
          .findCurrencyWithoutReaction(asset.denom);

        if (currency) {
          // If ibc currency is well known.
          if (
            "originCurrency" in currency &&
            currency.originCurrency &&
            "originChainId" in currency &&
            currency.originChainId &&
            // XXX: multi-hop ibc currency는 getSwapDestinationCurrencyAlternativeChains에서 처리한다.
            currency.paths.length === 1
          ) {
            if (
              currency.originChainId.startsWith("gravity-bridge-") &&
              currency.originCurrency.coinMinimalDenom !== "ugraviton"
            ) {
              continue;
            }
            if (
              !this.chainStore.isInChainInfosInListUI(currency.originChainId)
            ) {
              continue;
            }

            // 현재 CW20같은 얘들은 처리할 수 없다.
            if (!("type" in currency.originCurrency)) {
              // 일단 현재는 복잡한 케이스는 생각하지 않는다.
              // 오스모시스를 거쳐서 오기 때문에 ibc 모듈만 있다면 자산을 받을 수 있다.
              const originCurrency = currency.originCurrency;
              const inner = getMap(currency.originChainId);

              if (
                !inner.currencies.some(
                  (c) => c.coinMinimalDenom === originCurrency.coinMinimalDenom
                )
              ) {
                inner.currencies.push(originCurrency);
              }
            }
          } else if (!("paths" in currency)) {
            if (
              swapVenue.chainId === "osmosis-1" &&
              currency.coinMinimalDenom ===
                "ibc/0FA9232B262B89E77D1335D54FB1E1F506A92A7E4B51524B400DC69C68D28372"
            ) {
              const inner = getMap(swapVenue.chainId);

              if (
                !inner.currencies.some(
                  (c) => c.coinMinimalDenom === currency.coinMinimalDenom
                )
              ) {
                inner.currencies.push(currency);
              }

              continue;
            }

            // 현재 CW20같은 얘들은 처리할 수 없다.
            if (
              !("type" in currency) ||
              ("type" in currency &&
                (currency as ERC20Currency).type === "erc20")
            ) {
              // if currency is not ibc currency
              const inner = getMap(chainId);
              if (
                !inner.currencies.some(
                  (c) => c.coinMinimalDenom === currency.coinMinimalDenom
                )
              ) {
                inner.currencies.push(currency);
              }
            }
          }
        }
      }
    }

    return res;
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

      // Skip에서 내려주는 응답에서 symbol(coinDenom)이 같다면 해당 토큰의 도착 체인 후보가 될 수 있는 걸로 간주한다.
      const isEVMOnlyChain = chainInfo.chainId.startsWith("eip155:");
      const asset = this.queryAssets
        .getAssets(chainInfo.chainId)
        .assets.find((asset) => asset.denom === currency.coinMinimalDenom);
      for (const candidateChain of this.queryChains.chains) {
        const isCandidateChainEVMOnlyChain =
          candidateChain.chainInfo.chainId.startsWith("eip155:");
        const isCandidateChain =
          candidateChain.chainInfo.chainId !== chainInfo.chainId &&
          (isEVMOnlyChain ? true : isCandidateChainEVMOnlyChain);
        if (isCandidateChain) {
          const candidateAsset = this.queryAssets
            .getAssets(candidateChain.chainInfo.chainId)
            .assetsRaw.find(
              (a) =>
                a.recommendedSymbol &&
                a.recommendedSymbol === asset?.recommendedSymbol
            );

          if (candidateAsset) {
            const currencyFound = this.chainStore
              .getChain(candidateChain.chainInfo.chainId)
              .findCurrencyWithoutReaction(candidateAsset.denom);

            if (currencyFound) {
              res.push({
                denom: candidateAsset.denom,
                chainId: candidateChain.chainInfo.chainId,
              });
            }
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
