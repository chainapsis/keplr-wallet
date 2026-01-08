import { ObservableQueryChainsV2 } from "./chains";
import { computedFn } from "mobx-utils";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { InternalChainStore } from "../internal";
import { IBCChannelV2, NoneIBCBridgeInfoV2 } from "./types";
import { ObservableQueryTargetAssets } from "./target-assets";
import { ObservableQueryRelatedAssets } from "./related-assets";
import { AppCurrency, IBCCurrency } from "@keplr-wallet/types";

/**
 * ObservableQueryTransferPaths - v2 queries based transfer paths
 * @dev named it "TransferPaths" to avoid confusion with "Routes"
 */
export class ObservableQueryTransferPaths {
  constructor(
    protected readonly chainStore: InternalChainStore,
    protected readonly queryChains: ObservableQueryChainsV2,
    protected readonly queryTargetAssets: ObservableQueryTargetAssets,
    protected readonly queryRelatedAssets: ObservableQueryRelatedAssets
  ) {}

  /**
   * Returns a list of bridges that can be used to transfer the given coin minimal denom.
   *
   * @param chainId - The chain ID of the source chain.
   * @param coinMinimalDenom - The coin minimal denom of the source chain.
   * @returns A list of bridges that can be used to transfer the given coin minimal denom.
   * @dev This method is only used for EVM-based chains for now.
   */
  getBridges = computedFn(
    (chainId: string, coinMinimalDenom: string): NoneIBCBridgeInfoV2[] => {
      const chainInfo = this.chainStore.getChain(chainId);

      const isEVMSource = chainId.startsWith("eip155:");
      if (!isEVMSource) {
        return [];
      }

      const sourceChainIdentifier = ChainIdHelper.parse(chainId).identifier;

      const sourceCurrency =
        chainInfo.findCurrencyWithoutReaction(coinMinimalDenom);
      if (!sourceCurrency) {
        return [];
      }

      const symbol = sourceCurrency.coinDenom;

      const targetQuery = this.queryTargetAssets.getObservableQueryTargetAssets(
        chainId,
        coinMinimalDenom,
        1,
        200, // 200 would be enough, probably...
        symbol
      );

      if (!targetQuery.response) {
        return [];
      }

      const currenciesMap = targetQuery.currenciesMap;

      const res: NoneIBCBridgeInfoV2[] = [];

      for (const {
        chainInfo: targetChainInfo,
        currencies,
      } of currenciesMap.values()) {
        const isEVMTarget = targetChainInfo.chainId.startsWith("eip155:");
        if (!(isEVMTarget && isEVMSource)) {
          continue;
        }

        if (
          ChainIdHelper.parse(targetChainInfo.chainId).identifier ===
          sourceChainIdentifier
        ) {
          continue;
        }

        for (const currency of currencies) {
          // CHECK: 비교 로직 뭔가 필요할까
          res.push({
            destinationChainId: targetChainInfo.chainId,
            denom: currency.coinMinimalDenom,
          });
        }
      }

      return res;
    }
  );

  /**
   * Returns a list of IBC channels that can be used to transfer the given coin minimal denom.
   *
   * @param chainId - The chain ID of the source chain.
   * @param coinMinimalDenom - The coin minimal denom of the source chain.
   * @returns A list of IBC channels that can be used to transfer the given coin minimal denom.
   */
  getIBCChannels = computedFn(
    (chainId: string, coinMinimalDenom: string): IBCChannelV2[] => {
      if (!this.chainStore.hasChain(chainId)) {
        return [];
      }

      if (!this.chainStore.getChain(chainId).hasFeature("ibc-transfer")) {
        return [];
      }

      const sourceCurrency = this.chainStore
        .getChain(chainId)
        .findCurrencyWithoutReaction(coinMinimalDenom);
      // CHECK: 여기서 source currency 체크 안하고 바로 target currency 가져오는 게 맞을지도
      if (!sourceCurrency) {
        return [];
      }

      // CHECK: v2 쿼리에서는 기존에 skip에서 반환하던 ibc 정보를 바로 받아볼 수 없으므로,
      //       source 및 destination currency가 IBC Currency 타입이 아니면 탐색을 진행하지 않는다.
      if ("type" in sourceCurrency || !("paths" in sourceCurrency)) {
        return [];
      }

      const res: IBCChannelV2[] = [];

      const relatedQuery =
        this.queryRelatedAssets.getObservableQueryRelatedAssets(
          chainId,
          coinMinimalDenom
        );

      if (relatedQuery.response) {
        const relatedPaths = this.computePathsFromCurrencies(
          chainId,
          coinMinimalDenom,
          sourceCurrency,
          relatedQuery.currencies
        );
        res.push(...relatedPaths);
      }

      const symbol = sourceCurrency.coinDenom;
      const targetQuery = this.queryTargetAssets.getObservableQueryTargetAssets(
        chainId,
        coinMinimalDenom,
        1,
        100, // 100 would be enough, probably...
        symbol
      );

      if (targetQuery.response) {
        const targetPaths = this.computePathsFromCurrencies(
          chainId,
          coinMinimalDenom,
          sourceCurrency,
          targetQuery.currencies
        );

        for (const path of targetPaths) {
          if (
            !res.some(
              (r) =>
                r.destinationChainId === path.destinationChainId &&
                r.denom === path.denom
            )
          ) {
            res.push(path);
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

  /**
   * Computes the paths from the source currency to the target currencies.
   *
   * @param sourceChainId - The chain ID of the source chain.
   * @param sourceDenom - The denom of the source currency.
   * @param sourceCurrency - The source currency.
   * @param targetCurrencies - The target currencies.
   * @returns The routes from the source currency to the target currencies.
   */
  private computePathsFromCurrencies(
    sourceChainId: string,
    sourceDenom: string,
    sourceCurrency: IBCCurrency,
    targetCurrencies: (AppCurrency & { chainId: string })[]
  ): IBCChannelV2[] {
    const res: IBCChannelV2[] = [];

    const sourceChainIdentifier = ChainIdHelper.parse(sourceChainId).identifier;

    for (const targetCurrency of targetCurrencies) {
      if (
        ChainIdHelper.parse(targetCurrency.chainId).identifier ===
        sourceChainIdentifier
      ) {
        continue;
      }

      if (!this.chainStore.hasChain(targetCurrency.chainId)) {
        continue;
      }

      if (!this.chainStore.isInChainInfosInListUI(targetCurrency.chainId)) {
        continue;
      }

      const destCurrency = this.chainStore
        .getChain(targetCurrency.chainId)
        .findCurrencyWithoutReaction(targetCurrency.coinMinimalDenom);
      if (!destCurrency) {
        continue;
      }

      if ("type" in destCurrency || !("paths" in destCurrency)) {
        continue;
      }

      if (
        !sourceCurrency.originChainId ||
        !sourceCurrency.originCurrency ||
        !this.chainStore.hasChain(sourceCurrency.originChainId)
      ) {
        continue;
      }

      if (
        !destCurrency.originChainId ||
        !destCurrency.originCurrency ||
        !this.chainStore.hasChain(destCurrency.originChainId)
      ) {
        continue;
      }

      if (
        ChainIdHelper.parse(sourceCurrency.originChainId).identifier !==
        ChainIdHelper.parse(destCurrency.originChainId).identifier
      ) {
        continue;
      }

      const channels: {
        portId: string;
        channelId: string;
        counterpartyChainId: string;
      }[] = [];

      if (
        sourceCurrency.paths.length === 0 ||
        sourceCurrency.paths.some((path) => {
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

      const lastPath = sourceCurrency.paths[sourceCurrency.paths.length - 1];
      if (
        !lastPath.clientChainId ||
        ChainIdHelper.parse(lastPath.clientChainId).identifier !==
          ChainIdHelper.parse(sourceCurrency.originChainId).identifier
      ) {
        continue;
      }

      // Path to the origin chain
      channels.push(
        ...sourceCurrency.paths.map((path) => ({
          portId: path.portId,
          channelId: path.channelId,
          counterpartyChainId: path.clientChainId!,
        }))
      );

      if (
        destCurrency.paths.length === 0 ||
        destCurrency.paths.some((path) => {
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

      // Origin to the destination chain
      const reversedPaths = destCurrency.paths.slice().reverse();
      for (let i = 0; i < reversedPaths.length; i++) {
        const reversedPath = reversedPaths[i];
        channels.push({
          portId: reversedPath.counterpartyPortId!,
          channelId: reversedPath.counterpartyChannelId!,
          counterpartyChainId:
            reversedPaths.length > i + 1
              ? reversedPaths[i + 1].clientChainId!
              : targetCurrency.chainId,
        });
      }

      const pfmPossible = this.checkPFMPossibility(sourceChainId, channels);

      if (pfmPossible && channels.length > 0) {
        res.push({
          destinationChainId: targetCurrency.chainId,
          originDenom:
            sourceCurrency.originCurrency?.coinMinimalDenom || sourceDenom,
          originChainId: sourceCurrency.originChainId || sourceChainId,
          channels: channels,
          denom: targetCurrency.coinMinimalDenom,
        });
      }
    }

    return res;
  }

  /**
   * Checks if it is possible to transfer via packet forwarding module (PFM).
   *
   * @param sourceChainId - The chain ID of the source chain.
   * @param channels - The channels to transfer via packet forwarding.
   * @returns True if it is possible to transfer via packet forwarding, false otherwise.
   */
  private checkPFMPossibility(
    sourceChainId: string,
    channels: {
      portId: string;
      channelId: string;
      counterpartyChainId: string;
    }[]
  ): boolean {
    if (channels.length === 0) {
      return false;
    }

    // Direct transfer (1 hop) is always possible (no packet forwarding required)
    if (channels.length === 1) {
      return true;
    }

    // Multi-hop requires packet forwarding.
    if (
      !this.chainStore.getChain(sourceChainId).hasFeature("ibc-go") ||
      !this.queryChains.isSupportsMemo(sourceChainId)
    ) {
      return false;
    }

    // Intermediate chains also need to support packet forwarding.
    for (let i = 0; i < channels.length - 1; i++) {
      const channel = channels[i];
      if (
        !this.chainStore
          .getChain(channel.counterpartyChainId)
          .hasFeature("ibc-go") ||
        !this.queryChains.isSupportsMemo(channel.counterpartyChainId) ||
        !this.queryChains.isPFMEnabled(channel.counterpartyChainId)
      ) {
        return false;
      }
    }

    return true;
  }
}
