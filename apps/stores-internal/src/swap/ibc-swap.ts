// import { HasMapStore, IChainInfoImpl } from "@keplr-wallet/stores";
// import {
//   AppCurrency,
//   ChainInfo,
//   Currency,
//   ERC20Currency,
// } from "@keplr-wallet/types";
// import { computed, makeObservable } from "mobx";
// import { ObservableQueryChains } from "./chains";
// import { CoinPretty } from "@keplr-wallet/unit";
// import { ObservableQueryRoute, ObservableQueryRouteInner } from "./route";
// import { computedFn } from "mobx-utils";
// import { ObservableQueryIbcPfmTransfer } from "./ibc-pfm-transfer";
// import { ChainIdHelper } from "@keplr-wallet/cosmos";
// import { InternalChainStore } from "../internal";
// import { ObservableQuerySwappable } from "./swappable";
// import { ObservableQueryTargetAssets } from "./target-assets";
// import { ObservableQueryRelatedAssets } from "./related-assets";
// import { ObservableQueryValidateTargetAssets } from "./validate-target-assets";

// export class ObservableQueryIBCSwapInner {
//   constructor(
//     protected readonly chainStore: InternalChainStore,
//     protected readonly queryRoute: ObservableQueryRoute,
//     public readonly amountInDenom: string,
//     public readonly amountInAmount: string,
//     public readonly sourceAssetChainId: string,
//     public readonly destAssetDenom: string,
//     public readonly destAssetChainId: string,
//     public readonly affiliateFeeBps: number,
//     public readonly swapVenues: {
//       readonly name: string;
//       readonly chainId: string;
//     }[],
//     public readonly allowSwaps?: boolean,
//     public readonly smartSwapOptions?: {
//       evmSwaps?: boolean;
//       splitRoutes?: boolean;
//     }
//   ) {}

//   getQueryRoute(): ObservableQueryRouteInner {
//     const inAmount = new CoinPretty(
//       this.chainStore
//         .getChain(this.sourceAssetChainId)
//         .forceFindCurrency(this.amountInDenom),
//       this.amountInAmount
//     );

//     return this.queryRoute.getRoute(
//       this.sourceAssetChainId,
//       inAmount,
//       this.destAssetChainId,
//       this.destAssetDenom,
//       {}, // TODO: chainIdsToAddresses
//       50 // TODO: slippage
//     );
//   }
// }

// export class ObservableQueryIbcSwap extends HasMapStore<ObservableQueryIBCSwapInner> {
//   constructor(
//     protected readonly chainStore: InternalChainStore,
//     protected readonly queryChains: ObservableQueryChains,
//     protected readonly querySwappable: ObservableQuerySwappable,
//     protected readonly queryTargetAssets: ObservableQueryTargetAssets,
//     protected readonly queryRelatedAssets: ObservableQueryRelatedAssets,
//     protected readonly queryValidateTargetAssets: ObservableQueryValidateTargetAssets,
//     protected readonly queryRoute: ObservableQueryRoute,
//     protected readonly queryIBCPacketForwardingTransfer: ObservableQueryIbcPfmTransfer
//   ) {
//     super((str) => {
//       const parsed = JSON.parse(str);

//       return new ObservableQueryIBCSwapInner(
//         this.chainStore,
//         this.queryRoute,
//         parsed.sourceDenom,
//         parsed.sourceAmount,
//         parsed.sourceChainId,
//         parsed.destDenom,
//         parsed.destChainId,
//         parsed.affiliateFeeBps,
//         parsed.swapVenues,
//         parsed.allowSwaps,
//         parsed.smartSwapOptions
//       );
//     });

//     makeObservable(this);
//   }

//   getIBCSwap(
//     sourceChainId: string,
//     amount: CoinPretty,
//     destChainId: string,
//     destDenom: string,
//     affiliateFeeBps: number,
//     allowSwaps?: boolean
//   ): ObservableQueryIBCSwapInner {
//     const str = JSON.stringify({
//       sourceChainId,
//       sourceAmount: amount.toCoin().amount,
//       sourceDenom: amount.currency.coinMinimalDenom,
//       destChainId,
//       destDenom,
//       affiliateFeeBps,
//       allowSwaps,
//     });
//     return this.get(str);
//   }

//   // isSwapDestinationOrAlternatives = computedFn(
//   //   (chainId: string, currency: AppCurrency): boolean => {
//   //     this.queryValidateTargetAssets.isTargetAssetsToken()

//   //     // if (
//   //     //   this.swapDestinationCurrenciesMap
//   //     //     .get(this.chainStore.getChain(chainId).chainIdentifier)
//   //     //     ?.currencies.find(
//   //     //       (c) => c.coinMinimalDenom === currency.coinMinimalDenom
//   //     //     )
//   //     // ) {
//   //     //   return true;
//   //     // }
//   //     // if ("paths" in currency) {
//   //     //   // IBC currency인데 origin에 대한 정보가 없다면 처리할 수 없다.
//   //     //   if (!currency.originChainId || !currency.originCurrency) {
//   //     //     return false;
//   //     //   }
//   //     //   if (currency.originCurrency.coinMinimalDenom.startsWith("erc20:")) {
//   //     //     const nativeCurrency = this.chainStore
//   //     //       .getChain(currency.originChainId)
//   //     //       .currencies.find((cur) => cur.coinMinimalDenom.endsWith("-native"));
//   //     //     if (nativeCurrency) {
//   //     //       const wrappedNativeAddress =
//   //     //         WRAPPED_NATIVE_ADDRESSES[currency.originChainId];
//   //     //       if (
//   //     //         wrappedNativeAddress &&
//   //     //         currency.originCurrency.coinMinimalDenom.toLowerCase() ===
//   //     //           `erc20:${wrappedNativeAddress}`.toLowerCase()
//   //     //       ) {
//   //     //         const bridges = this.queryIBCPacketForwardingTransfer.getBridges(
//   //     //           currency.originChainId,
//   //     //           nativeCurrency.coinMinimalDenom
//   //     //         );
//   //     //         for (const bridge of bridges) {
//   //     //           if (
//   //     //             ChainIdHelper.parse(bridge.destinationChainId).identifier ===
//   //     //               ChainIdHelper.parse(chainId).identifier &&
//   //     //             bridge.denom === currency.coinMinimalDenom
//   //     //           ) {
//   //     //             return true;
//   //     //           }
//   //     //         }
//   //     //       }
//   //     //     }
//   //     //   } else {
//   //     //     const originOutChainId = currency.originChainId;
//   //     //     const originOutCurrency = currency.originCurrency;
//   //     //     const channels = this.queryIBCPacketForwardingTransfer.getIBCChannels(
//   //     //       originOutChainId,
//   //     //       originOutCurrency.coinMinimalDenom
//   //     //     );
//   //     //     // 다른 후보들은 사실 ibc pfm transfer가 가능한 채널 정보와 로직이 유사하다.
//   //     //     // 차이점은 ibc pfm transfer의 경우는 시작지점이 tx를 보내는 체인이지만
//   //     //     // ibc swap의 경우는 이렇게 처리할 수 없다. (일단 기본적으로 무조건 osmosis를 거치기 때문에)
//   //     //     // ibc pfm transfer의 경우 시작 지점을 보내는 체인의 경우 ibc module의 memo만 지원하면
//   //     //     // 두번째 체인부터 pfm을 지원하면 되기 때문에 보내는 체인의 경우는 이러한 확인을 하지 않는다.
//   //     //     // 하지만 ibc swap의 경우는 ibc pfm transfer 상의 보내는 체인은 시작 지점이 될 수 없기 때문에 pfm에 대한 확인을 꼭 해야한다.
//   //     //     if (
//   //     //       !this.chainStore.getChain(originOutChainId).hasFeature("ibc-go") ||
//   //     //       !this.queryChains.isSupportsMemo(originOutChainId) ||
//   //     //       !this.queryChains.isPFMEnabled(originOutChainId)
//   //     //     ) {
//   //     //       // 만약 originOutChainId가 ibc-pfm을 지원하지 않는다면
//   //     //       // 여기서 더 routing할 방법은 없다.
//   //     //       // osmosis의 경우는 ibc transfer가 아니라 그대로 osmosis에서 남기 때문에
//   //     //       // 따로 추가해주고 반환한다.
//   //     //       const findSwapVenue = channels.find(
//   //     //         (channel) =>
//   //     //           channel.channels.length === 1 &&
//   //     //           this.swapVenues.some(
//   //     //             (swapVenue) =>
//   //     //               this.chainStore.getChain(swapVenue.chainId)
//   //     //                 .chainIdentifier ===
//   //     //               this.chainStore.getChain(
//   //     //                 channel.channels[0].counterpartyChainId
//   //     //               ).chainIdentifier
//   //     //           )
//   //     //       );
//   //     //       if (findSwapVenue) {
//   //     //         return true;
//   //     //       }
//   //     //     }
//   //     //     for (const channel of channels) {
//   //     //       if (
//   //     //         channel.destinationChainId ===
//   //     //           this.chainStore.getChain(chainId).chainId &&
//   //     //         channel.denom === currency.coinMinimalDenom
//   //     //       ) {
//   //     //         return true;
//   //     //       }
//   //     //     }
//   //     //   }
//   //     // } else {
//   //     //   return this.queryChains.isChainTypeEVM(chainId);
//   //     // }
//   //     // return false;
//   //   }
//   // );

//   getSwapDestinationCurrencyAlternativeChains = computedFn(
//     (
//       chainInfo: IChainInfoImpl,
//       currency: AppCurrency
//     ): { denom: string; chainId: string }[] => {
//       if (
//         "paths" in currency &&
//         (!currency.originChainId || !currency.originCurrency)
//       ) {
//         // IBC currency인데 origin에 대한 정보가 없다면 처리할 수 없다.
//         // 사실상 오류 케이스인데 어케 처리할 지 난해하기 때문에 일단 빈 배열을 반환.
//         return [];
//       }

//       const originOutChainId = (() => {
//         if ("originChainId" in currency && currency.originChainId) {
//           return currency.originChainId;
//         }
//         return chainInfo.chainId;
//       })();
//       const originOutCurrency = (() => {
//         if ("originCurrency" in currency && currency.originCurrency) {
//           return currency.originCurrency;
//         }
//         return currency;
//       })();

//       const chainIdsToEnsure = new Set<string>([chainInfo.chainId]);
//       if (originOutChainId !== chainInfo.chainId) {
//         chainIdsToEnsure.add(originOutChainId);
//       }

//       const candidateChains: IChainInfoImpl<ChainInfo>[] = [];

//       // 밑에서 따로 IBC 경로에 대한 처리를 하기 때문에 여기선 EVM 체인이 포함된 경우만 다룬다.
//       for (const chain of this.queryChains.chains) {
//         const isSameChain = chain.chainInfo.chainId === chainInfo.chainId;
//         const containsEVMOnlyChain =
//           chain.chainInfo.chainId.startsWith("eip155:") ||
//           chainInfo.chainId.startsWith("eip155:");
//         const isCandidateChain = !isSameChain && containsEVMOnlyChain;
//         if (isCandidateChain) {
//           candidateChains.push(chain.chainInfo);
//           chainIdsToEnsure.add(chain.chainInfo.chainId);
//         }
//       }

//       const res: { denom: string; chainId: string }[] =
//         !this.chainStore.isInChainInfosInListUI(originOutChainId)
//           ? []
//           : [
//               {
//                 // 기본적으로 origin에 대한 정보를 넣어준다.
//                 chainId: originOutChainId,
//                 denom: originOutCurrency.coinMinimalDenom,
//               },
//             ];

//       const assetsBatch = this.assetsBatch.findCachedAssetsBatch(
//         Array.from(chainIdsToEnsure)
//       );

//       const asset = assetsBatch
//         .get(chainInfo.chainId)
//         ?.find((asset) => asset.denom === currency.coinMinimalDenom);
//       for (const candidateChain of candidateChains) {
//         // Skip에서 내려주는 응답에서 recommended symbol 혹은 origin denom과 origin chain id가 같다면 해당 토큰의 도착 체인 후보가 될 수 있는 걸로 간주한다.
//         const candidateAsset = assetsBatch
//           .get(candidateChain.chainId)
//           ?.find(
//             (a) =>
//               a.recommendedSymbol === asset?.recommendedSymbol ||
//               (a.originDenom === asset?.originDenom &&
//                 a.originChainId === asset?.originChainId)
//           );

//         if (candidateAsset) {
//           const currencyFound = candidateChain.findCurrencyWithoutReaction(
//             candidateAsset.denom
//           );

//           if (currencyFound) {
//             res.push({
//               denom: candidateAsset.denom,
//               chainId: candidateChain.chainId,
//             });
//           }
//         }
//       }

//       const channels = this.queryIBCPacketForwardingTransfer.getIBCChannels(
//         originOutChainId,
//         originOutCurrency.coinMinimalDenom
//       );
//       // 다른 후보들은 사실 ibc pfm transfer가 가능한 채널 정보와 로직이 유사하다.
//       // 차이점은 ibc pfm transfer의 경우는 시작지점이 tx를 보내는 체인이지만
//       // ibc swap의 경우는 이렇게 처리할 수 없다. (일단 기본적으로 무조건 osmosis를 거치기 때문에)
//       // ibc pfm transfer의 경우 시작 지점을 보내는 체인의 경우 ibc module의 memo만 지원하면
//       // 두번째 체인부터 pfm을 지원하면 되기 때문에 보내는 체인의 경우는 이러한 확인을 하지 않는다.
//       // 하지만 ibc swap의 경우는 ibc pfm transfer 상의 보내는 체인은 시작 지점이 될 수 없기 때문에 pfm에 대한 확인을 꼭 해야한다.
//       if (
//         !this.chainStore.getChain(originOutChainId).hasFeature("ibc-go") ||
//         !this.queryChains.isSupportsMemo(originOutChainId) ||
//         !this.queryChains.isPFMEnabled(originOutChainId)
//       ) {
//         // 만약 originOutChainId가 ibc-pfm을 지원하지 않는다면
//         // 여기서 더 routing할 방법은 없다.
//         // osmosis의 경우는 ibc transfer가 아니라 그대로 osmosis에서 남기 때문에
//         // 따로 추가해주고 반환한다.
//         const findSwapVenue = channels.find(
//           (channel) =>
//             channel.channels.length === 1 &&
//             this.swapVenues.some(
//               (swapVenue) =>
//                 this.chainStore.getChain(swapVenue.chainId).chainIdentifier ===
//                 this.chainStore.getChain(
//                   channel.channels[0].counterpartyChainId
//                 ).chainIdentifier
//             )
//         );
//         if (findSwapVenue) {
//           res.push({
//             denom: findSwapVenue.denom,
//             chainId: findSwapVenue.destinationChainId,
//           });
//         }
//         return res;
//       }
//       for (const channel of channels) {
//         if (channel.channels.length > 0) {
//           res.push({
//             denom: channel.denom,
//             chainId: channel.destinationChainId,
//           });
//         }
//       }

//       return res.filter(({ chainId }) => {
//         return this.chainStore.isInChainInfosInListUI(chainId);
//       });
//     }
//   );
// }

// // const WRAPPED_NATIVE_ADDRESSES: Record<string, string | undefined> = {
// //   "eip155:1": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
// //   "eip155:8453": "0x4200000000000000000000000000000000000006",
// //   "eip155:10": "0x4200000000000000000000000000000000000006",
// //   "eip155:42161": "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
// //   "eip155:137": "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", // WPOL
// //   "eip155:56": "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // WBNB
// //   "eip155:43114": "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7", // WAVAX
// // } as const;
