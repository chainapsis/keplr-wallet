import { ObservableQueryAssetsFromSource } from "./assets-from-source";
import { ObservableQueryChains } from "./chains";
import { computedFn } from "mobx-utils";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { InternalChainStore } from "../internal";
import { ObservableQueryAssets } from "./assets";
import { IBCChannel, NoneIBCBridgeInfo } from "./types";

export class ObservableQueryIbcPfmTransfer {
  constructor(
    protected readonly chainStore: InternalChainStore,
    protected readonly queryChains: ObservableQueryChains,
    protected readonly queryAssets: ObservableQueryAssets,
    protected readonly queryAssetsFromSource: ObservableQueryAssetsFromSource
  ) {}

  getBridges = computedFn(
    (chainId: string, coinMinimalDenom: string): NoneIBCBridgeInfo[] => {
      const res: NoneIBCBridgeInfo[] = [];

      const chainInfo = this.chainStore.getChain(chainId);

      const isEVMOnlyChain = chainInfo.chainId.startsWith("eip155:");

      const assetForBridge = this.queryAssets
        .getAssets(chainInfo.chainId)
        .assetsRaw.find((asset) => asset.denom === coinMinimalDenom);

      for (const candidateChain of this.queryChains.chains) {
        const isCandidateChainEVMOnlyChain =
          candidateChain.chainInfo.chainId.startsWith("eip155:");
        const isCandidateChain =
          candidateChain.chainInfo.chainId !== chainInfo.chainId &&
          (isEVMOnlyChain || isCandidateChainEVMOnlyChain);

        if (isCandidateChain) {
          const candidateAsset = this.queryAssets
            .getAssets(candidateChain.chainInfo.chainId)
            .assetsRaw.find(
              (a) =>
                a.recommendedSymbol &&
                a.recommendedSymbol === assetForBridge?.recommendedSymbol
            );

          if (candidateAsset) {
            const currencyFound = this.chainStore
              .getChain(candidateChain.chainInfo.chainId)
              .findCurrencyWithoutReaction(candidateAsset.denom);

            if (currencyFound) {
              res.push({
                destinationChainId: candidateChain.chainInfo.chainId,
                denom: candidateAsset.denom,
              });
            }
          }
        }
      }
      return res;
    }
  );

  getIBCChannels = computedFn(
    (chainId: string, denom: string): IBCChannel[] => {
      if (!this.chainStore.hasChain(chainId)) {
        return [];
      }

      if (!this.chainStore.getChain(chainId).hasFeature("ibc-transfer")) {
        return [];
      }

      const assetsFromSource = this.queryAssetsFromSource.getSourceAsset(
        chainId,
        denom
      ).assetsFromSource;

      if (!assetsFromSource) {
        return [];
      }

      const res: {
        destinationChainId: string;
        originDenom: string;
        originChainId: string;

        channels: {
          portId: string;
          channelId: string;

          counterpartyChainId: string;
        }[];

        denom: string;
      }[] = [];

      for (const assetChainId of Object.keys(assetsFromSource)) {
        if (this.chainStore.hasChain(assetChainId)) {
          const assets = assetsFromSource[assetChainId]!.assets;
          // TODO: 미래에는 assets가 두개 이상이 될수도 있다고 한다.
          //       근데 지금은 한개로만 고정되어 있다고 한다...
          //       나중에 두개 이상의 경우가 생기면 다시 생각해보자...
          if (assets.length >= 1) {
            const asset = assets[0];
            if (
              asset.chainId === assetChainId &&
              this.chainStore.hasChain(asset.chainId) &&
              this.chainStore.hasChain(asset.originChainId)
            ) {
              if (!this.chainStore.isInChainInfosInListUI(asset.chainId)) {
                continue;
              }

              const channels: {
                portId: string;
                channelId: string;

                counterpartyChainId: string;
              }[] = [];

              const currency = this.chainStore
                .getChain(chainId)
                .findCurrencyWithoutReaction(denom);
              const destinationCurrency = this.chainStore
                .getChain(asset.chainId)
                .findCurrencyWithoutReaction(asset.denom);

              if (
                currency &&
                !("type" in currency) &&
                destinationCurrency &&
                !("type" in destinationCurrency)
              ) {
                if ("paths" in currency) {
                  if (
                    !currency.originChainId ||
                    !currency.originCurrency ||
                    !this.chainStore.hasChain(currency.originChainId)
                  ) {
                    continue;
                  }

                  if (
                    ChainIdHelper.parse(currency.originChainId).identifier !==
                    ChainIdHelper.parse(asset.originChainId).identifier
                  ) {
                    continue;
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
                    continue;
                  }

                  const lastPath = currency.paths[currency.paths.length - 1];
                  if (
                    !lastPath.clientChainId ||
                    ChainIdHelper.parse(lastPath.clientChainId).identifier !==
                      ChainIdHelper.parse(asset.originChainId).identifier
                  ) {
                    continue;
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
                }
                if ("paths" in destinationCurrency) {
                  if (
                    !destinationCurrency.originChainId ||
                    !destinationCurrency.originCurrency ||
                    !this.chainStore.hasChain(destinationCurrency.originChainId)
                  ) {
                    continue;
                  }

                  if (
                    ChainIdHelper.parse(destinationCurrency.originChainId)
                      .identifier !==
                    ChainIdHelper.parse(asset.originChainId).identifier
                  ) {
                    continue;
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
                    continue;
                  }

                  const reversedPaths = destinationCurrency.paths
                    .slice()
                    .reverse();
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
                  res.push({
                    destinationChainId: asset.chainId,
                    originDenom: asset.originDenom,
                    originChainId: asset.originChainId,
                    channels: channels,
                    denom: asset.denom,
                  });
                }
              }
            }
          }
        }
      }

      return res
        .filter((r) => {
          // In evmos the ibc token is automatically wrapped in erc20 and currently Keplr cannot handle erc20. For now, block sending to evmos
          if (
            r.destinationChainId.startsWith("evmos_") &&
            r.originDenom !== "aevmos"
          ) {
            return false;
          }
          return true;
        })
        .sort((a, b) => {
          // Sort by chain name.
          return this.chainStore
            .getChain(a.destinationChainId)
            .chainName.trim()
            .localeCompare(
              this.chainStore.getChain(b.destinationChainId).chainName.trim()
            );
        });
    }
  );
}
