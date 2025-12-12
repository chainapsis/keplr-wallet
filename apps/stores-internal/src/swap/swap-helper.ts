import { HasMapStore, IChainInfoImpl } from "@keplr-wallet/stores";
import { AppCurrency } from "@keplr-wallet/types";
import { ObservableQuerySwappable } from "./swappable";
import { ObservableQueryRelatedAssets } from "./related-assets";
import { ObservableQueryTransferPaths } from "./transfer-paths";
import { ObservableQueryChainsV2 } from "./chains";
import { InternalChainStore } from "../internal";
import { computedFn } from "mobx-utils";
import { ObservableQueryRouteV2, ObservableQueryRouteInnerV2 } from "./route";
import { ObservableQueryValidateTargetAssets } from "./validate-target-assets";
import { makeObservable } from "mobx";
import { ObservableQueryTxInnerV2, ObservableQueryTxV2 } from "./txs";
import { SwapProvider, SkipOperation } from "./types";

export class ObservableQuerySwapHelperInner {
  constructor(
    protected readonly chainStore: InternalChainStore,
    protected readonly queryRoute: ObservableQueryRouteV2,
    protected readonly queryTx: ObservableQueryTxV2,
    public readonly fromChainId: string,
    public readonly fromDenom: string,
    public readonly fromAmount: string,
    public readonly toChainId: string,
    public readonly toDenom: string,
    public readonly fromAddress: string,
    public readonly toAddress: string
  ) {}

  getRoute(
    slippage: number,
    providers?: SwapProvider[]
  ): ObservableQueryRouteInnerV2 {
    return this.queryRoute.getRoute(
      this.fromChainId,
      this.fromDenom,
      this.fromAmount,
      this.toChainId,
      this.toDenom,
      this.fromAddress,
      this.toAddress,
      slippage,
      providers
    );
  }

  getTx(
    chainIdsToAddresses: Record<string, string>,
    slippage: number,
    provider: SwapProvider,
    amountOut?: string,
    requiredChainIds?: string[],
    skipOperations?: SkipOperation[]
  ): ObservableQueryTxInnerV2 {
    if (provider === SwapProvider.SKIP) {
      if (!amountOut || !requiredChainIds || !skipOperations) {
        throw new Error(
          "SKIP provider requires amountOut, requiredChainIds, and skipOperations"
        );
      }
      return this.queryTx.getTx(
        this.fromChainId,
        this.fromDenom,
        this.fromAmount,
        this.toChainId,
        this.toDenom,
        chainIdsToAddresses,
        slippage,
        SwapProvider.SKIP,
        amountOut,
        requiredChainIds,
        skipOperations
      );
    } else {
      return this.queryTx.getTx(
        this.fromChainId,
        this.fromDenom,
        this.fromAmount,
        this.toChainId,
        this.toDenom,
        chainIdsToAddresses,
        slippage,
        SwapProvider.SQUID
      );
    }
  }
}
/**
 * Swap-related query aggregator that provides an interface similar to `ObservableQueryIbcSwap`.
 */
export class ObservableQuerySwapHelper extends HasMapStore<ObservableQuerySwapHelperInner> {
  constructor(
    protected readonly chainStore: InternalChainStore,
    protected readonly querySwappable: ObservableQuerySwappable,
    protected readonly queryValidateTargetAssets: ObservableQueryValidateTargetAssets,
    protected readonly queryRelatedAssets: ObservableQueryRelatedAssets,
    protected readonly queryTransferPaths: ObservableQueryTransferPaths,
    protected readonly queryChains: ObservableQueryChainsV2,
    protected readonly queryRoute: ObservableQueryRouteV2,
    protected readonly queryTx: ObservableQueryTxV2
  ) {
    super((str) => {
      const parsed = JSON.parse(str);

      return new ObservableQuerySwapHelperInner(
        this.chainStore,
        this.queryRoute,
        this.queryTx,
        parsed.fromChainId,
        parsed.fromDenom,
        parsed.fromAmount,
        parsed.toChainId,
        parsed.toDenom,
        parsed.fromAddress,
        parsed.toAddress
      );
    });

    makeObservable(this);
  }

  getSwapHelper(
    fromChainId: string,
    fromDenom: string,
    fromAmount: string,
    toChainId: string,
    toDenom: string,
    fromAddress: string,
    toAddress: string
  ): ObservableQuerySwapHelperInner {
    const str = JSON.stringify({
      fromChainId,
      fromDenom,
      fromAmount,
      toChainId,
      toDenom,
      fromAddress,
      toAddress,
    });
    return this.get(str);
  }

  isSwappableCurrency = computedFn(
    (chainId: string, currency: AppCurrency): boolean => {
      // pre-filtering logic before querying swappable
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

        // ibc currency with type is not supported yet
        if ("type" in currency.originCurrency) {
          return false;
        }
      }

      if (!this.chainStore.isInChainInfosInListUI(chainId)) {
        return false;
      }

      return this.querySwappable.isSwappableToken(
        chainId,
        currency.coinMinimalDenom
      );
    }
  );

  isSwapDestinationOrAlternatives = computedFn(
    (
      sourceChainId: string,
      sourceDenom: string,
      destChainId: string,
      destDenom: string
    ): boolean => {
      // CHECK: 단순히 swappable 여부만 체크하기에는 destination asset을 source asset으로
      // 사용할 수 없는 케이스도 있기 때문에 어쩔 수 없이 기존 인터페이스와 달리 추가적인 파라미터를 받아서 처리해야 한다.
      const isTarget = this.queryValidateTargetAssets.isTargetAssetsToken(
        sourceChainId,
        sourceDenom,
        {
          chainId: destChainId,
          denom: destDenom,
        }
      );

      if (isTarget) {
        return true;
      }

      const isAlternative = this.queryRelatedAssets.isRelatedAssetsToken(
        sourceChainId,
        sourceDenom,
        destChainId,
        destDenom
      );

      return isAlternative;
    }
  );

  getSwapDestinationCurrencyAlternativeChains = computedFn(
    (
      chainInfo: IChainInfoImpl,
      currency: AppCurrency
    ): { denom: string; chainId: string }[] => {
      const alternativeCurrencies =
        this.queryRelatedAssets.getObservableQueryRelatedAssets(
          chainInfo.chainId,
          currency.coinMinimalDenom
        ).currencies;

      const res: { denom: string; chainId: string }[] = [];
      for (const currency of alternativeCurrencies) {
        res.push({
          denom: currency.coinMinimalDenom,
          chainId: currency.chainId,
        });
      }
      return res;
    }
  );
}
