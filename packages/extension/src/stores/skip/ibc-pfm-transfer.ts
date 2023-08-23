import { ChainGetter } from "@keplr-wallet/stores";
import { ObservableQueryAssetsFromSource } from "./assets-from-source";
import { ObservableQueryChains } from "./chains";
import { computedFn } from "mobx-utils";
import { ChainIdHelper } from "@keplr-wallet/cosmos";

export class ObservableQueryIbcPfmTransfer {
  constructor(
    protected readonly chainGetter: ChainGetter,
    protected readonly queryChains: ObservableQueryChains,
    protected readonly queryAssetsFromSource: ObservableQueryAssetsFromSource
  ) {}

  getIBCChannels = computedFn(
    (
      chainId: string,
      denom: string
    ): {
      destinationChainId: string;
      originDenom: string;
      originChainId: string;

      channels: {
        portId: string;
        channelId: string;

        counterpartyChainId: string;
      }[];
    }[] => {
      if (!this.chainGetter.hasChain(chainId)) {
        return [];
      }

      if (!this.chainGetter.getChain(chainId).hasFeature("ibc-transfer")) {
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
      }[] = [];

      for (const assetChainId of Object.keys(assetsFromSource)) {
        if (this.chainGetter.hasChain(assetChainId)) {
          const assets = assetsFromSource[assetChainId]!.assets;
          // TODO: 미래에는 assets가 두개 이상이 될수도 있다고 한다.
          //       근데 지금은 한개로만 고정되어 있다고 한다...
          //       나중에 두개 이상의 경우가 생기면 다시 생각해보자...
          if (assets.length >= 1) {
            const asset = assets[0];
            if (
              asset.chainId === assetChainId &&
              this.chainGetter.hasChain(asset.chainId) &&
              this.chainGetter.hasChain(asset.originChainId)
            ) {
              const channels: {
                portId: string;
                channelId: string;

                counterpartyChainId: string;
              }[] = [];

              const currency = this.chainGetter
                .getChain(chainId)
                .findCurrency(denom);
              const destinationCurrency = this.chainGetter
                .getChain(asset.chainId)
                .findCurrency(asset.denom);

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
                    !this.chainGetter.hasChain(currency.originChainId)
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
                        !this.chainGetter.hasChain(path.clientChainId)
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
                    !this.chainGetter.hasChain(
                      destinationCurrency.originChainId
                    )
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
                        !this.chainGetter.hasChain(path.clientChainId)
                      );
                    })
                  ) {
                    continue;
                  }

                  const reversedPaths = destinationCurrency.paths.reverse();
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
                    !this.chainGetter.getChain(chainId).hasFeature("ibc-go") ||
                    !this.queryChains.isSupportsMemo(chainId)
                  ) {
                    pfmPossibility = false;
                  }

                  if (pfmPossibility) {
                    for (let i = 0; i < channels.length - 1; i++) {
                      const channel = channels[i];
                      if (
                        !this.chainGetter
                          .getChain(channel.counterpartyChainId)
                          .hasFeature("ibc-go") ||
                        !this.queryChains.isSupportsMemo(
                          channel.counterpartyChainId
                        )
                      ) {
                        pfmPossibility = false;
                        break;
                      }

                      if (i >= 1) {
                        if (
                          !this.queryChains.isPFMEnabled(
                            channel.counterpartyChainId
                          ) ||
                          !this.chainGetter
                            .getChain(channel.counterpartyChainId)
                            .hasFeature("ibc-pfm")
                        ) {
                          pfmPossibility = false;
                          break;
                        }
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
          return this.chainGetter
            .getChain(a.destinationChainId)
            .chainName.trim()
            .localeCompare(
              this.chainGetter.getChain(b.destinationChainId).chainName.trim()
            );
        });
    }
  );
}
