import { useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useEffectOnce } from "../../../hooks/use-effect-once";
import { useStore } from "../../../stores";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { AppCurrency } from "@keplr-wallet/types";
import { IBCSwapAmountConfig } from "@keplr-wallet/hooks-internal";
import {
  FeeConfig,
  GasConfig,
  MemoConfig,
  SenderConfig,
} from "@keplr-wallet/hooks";

interface SwapAnalyticsArgs {
  inChainId: string;
  inCurrency: AppCurrency;
  outChainId: string;
  outCurrency: AppCurrency;
  ibcSwapConfigs: {
    amountConfig: IBCSwapAmountConfig;
    memoConfig: MemoConfig;
    gasConfig: GasConfig;
    feeConfig: FeeConfig;
    senderConfig: SenderConfig;
  };
  swapFeeBps: number;
}

export const useSwapAnalytics = ({
  inChainId,
  inCurrency,
  outChainId,
  outCurrency,
  ibcSwapConfigs,
  swapFeeBps,
}: SwapAnalyticsArgs) => {
  const [searchParams] = useSearchParams();
  const {
    analyticsAmplitudeStore,
    chainStore,
    keyRingStore,
    uiConfigStore,
    priceStore,
    queriesStore,
  } = useStore();

  const requestIdRef = useRef<string>(
    (crypto as any)?.randomUUID
      ? (crypto as any).randomUUID()
      : Math.random().toString(36).substring(2)
  );

  const prevInRef = useRef<{ chainId: string; denom: string }>({
    chainId: "",
    denom: "",
  });
  const prevOutRef = useRef<{ chainId: string; denom: string }>({
    chainId: "",
    denom: "",
  });
  const prevFractionRef = useRef<number>(0);
  const prevSlippageRef = useRef<number>(
    uiConfigStore.ibcSwapConfig.slippageNum
  );
  const prevFetchingRef = useRef<boolean>(false);
  const prevRouteKeyRef = useRef<any>(undefined);

  // swap_entry (only once)
  useEffectOnce(() => {
    const entryPoint = (() => {
      const p =
        searchParams.get("entry_point") || searchParams.get("entryPoint");
      if (p) return p;
      if (searchParams.get("coinMinimalDenom")) return "token_detail";
      return "direct";
    })();

    analyticsAmplitudeStore.logEvent("swap_entry", {
      request_id: requestIdRef.current,
      entry_point: entryPoint,
      in_chain_id: inChainId,
      in_chain_identifier: ChainIdHelper.parse(inChainId).identifier,
      in_coin_minimal_denom: inCurrency.coinMinimalDenom,
      in_coin_denom: inCurrency.coinDenom,
      wallet_type: keyRingStore.selectedKeyInfo?.type,
      is_evm_in_chain: chainStore.isEvmOnlyChain(inChainId),
    });
  });

  // source / destination selected
  useEffect(() => {
    if (
      prevInRef.current.chainId !== inChainId ||
      prevInRef.current.denom !== inCurrency.coinMinimalDenom
    ) {
      analyticsAmplitudeStore.logEvent("swap_source_selected", {
        request_id: requestIdRef.current,
        in_chain_id: inChainId,
        in_chain_identifier: ChainIdHelper.parse(inChainId).identifier,
        in_coin_minimal_denom: inCurrency.coinMinimalDenom,
        in_coin_denom: inCurrency.coinDenom,
      });
      prevInRef.current = {
        chainId: inChainId,
        denom: inCurrency.coinMinimalDenom,
      };
    }
  }, [
    inChainId,
    inCurrency.coinMinimalDenom,
    analyticsAmplitudeStore,
    inCurrency.coinDenom,
  ]);

  useEffect(() => {
    if (
      prevOutRef.current.chainId !== outChainId ||
      prevOutRef.current.denom !== outCurrency.coinMinimalDenom
    ) {
      analyticsAmplitudeStore.logEvent("swap_destination_selected", {
        request_id: requestIdRef.current,
        out_chain_id: outChainId,
        out_chain_identifier: ChainIdHelper.parse(outChainId).identifier,
        out_coin_denom: outCurrency.coinDenom,
      });
      prevOutRef.current = {
        chainId: outChainId,
        denom: outCurrency.coinMinimalDenom,
      };
    }
  }, [
    outChainId,
    outCurrency.coinMinimalDenom,
    analyticsAmplitudeStore,
    outCurrency.coinDenom,
  ]);

  // MAX button clicked
  useEffect(() => {
    const currentFraction = ibcSwapConfigs.amountConfig.fraction;
    if (prevFractionRef.current !== currentFraction && currentFraction === 1) {
      const balanceCoin = queriesStore
        .get(inChainId)
        .queryBalances.getQueryBech32Address(ibcSwapConfigs.senderConfig.sender)
        .getBalance(inCurrency);

      const balance_before_raw = balanceCoin
        ? (balanceCoin as any).balance.toCoin().amount.toString()
        : "0";

      analyticsAmplitudeStore.logEvent("swap_max_btn_clicked", {
        request_id: requestIdRef.current,
        balance_before_raw,
        amount_set_raw: ibcSwapConfigs.amountConfig.value,
        in_chain_id: inChainId,
        in_coin_denom: inCurrency.coinDenom,
      });
    }
    prevFractionRef.current = currentFraction;
  }, [
    ibcSwapConfigs.amountConfig.fraction,
    analyticsAmplitudeStore,
    ibcSwapConfigs.amountConfig.value,
    ibcSwapConfigs.senderConfig.sender,
    inChainId,
    inCurrency,
    queriesStore,
  ]);

  // Slippage changed
  useEffect(() => {
    const current = uiConfigStore.ibcSwapConfig.slippageNum;
    if (prevSlippageRef.current !== current) {
      analyticsAmplitudeStore.logEvent("swap_slippage_changed", {
        request_id: requestIdRef.current,
        prev_slippage_bps: prevSlippageRef.current * 100,
        new_slippage_bps: current * 100,
        button_clicked: uiConfigStore.ibcSwapConfig.slippageIsCustom
          ? "custom"
          : `${uiConfigStore.ibcSwapConfig.slippage}%`,
      });
      prevSlippageRef.current = current;
    }
  }, [
    uiConfigStore.ibcSwapConfig.slippageNum,
    analyticsAmplitudeStore,
    uiConfigStore.ibcSwapConfig.slippage,
    uiConfigStore.ibcSwapConfig.slippageIsCustom,
  ]);

  // Quote requested / received
  const queryIBCSwapForLog = ibcSwapConfigs.amountConfig.getQueryIBCSwap();
  const queryRouteForLog = queryIBCSwapForLog?.getQueryRoute();

  useEffect(() => {
    if (!queryRouteForLog) return;
    if (!prevFetchingRef.current && queryRouteForLog.isFetching) {
      const inAmountRaw =
        ibcSwapConfigs.amountConfig.amount.length > 0
          ? ibcSwapConfigs.amountConfig.amount[0].toCoin().amount.toString()
          : "0";
      const inAmountUsd = (() => {
        const p = priceStore.calculatePrice(
          ibcSwapConfigs.amountConfig.amount[0],
          "usd"
        );
        return p ? p.toDec().toString() : undefined;
      })();

      analyticsAmplitudeStore.logEvent("swap_quote_requested", {
        request_id: requestIdRef.current,
        in_chain_id: inChainId,
        in_coin_denom: inCurrency.coinDenom,
        out_chain_id: outChainId,
        out_coin_denom: outCurrency.coinDenom,
        in_amount_raw: inAmountRaw,
        in_amount_usd: inAmountUsd,
        swap_fee_bps: swapFeeBps,
        slippage_bps: uiConfigStore.ibcSwapConfig.slippageNum * 100,
      });
    }
    prevFetchingRef.current = queryRouteForLog.isFetching;
  }, [
    queryRouteForLog?.isFetching,
    analyticsAmplitudeStore,
    inCurrency,
    outCurrency,
    swapFeeBps,
    uiConfigStore.ibcSwapConfig.slippageNum,
    inChainId,
    outChainId,
    ibcSwapConfigs.amountConfig.amount,
    priceStore,
    queryRouteForLog,
  ]);

  useEffect(() => {
    if (!queryRouteForLog || !queryRouteForLog.response) return;
    const currentKey = queryRouteForLog.response.data.amount_out;
    if (prevRouteKeyRef.current === currentKey) return;

    const outAmountRaw = queryRouteForLog.response.data.amount_out;
    const outCoinPretty = new CoinPretty(outCurrency, outAmountRaw.toString());
    const outUsd = (() => {
      const p = priceStore.calculatePrice(outCoinPretty, "usd");
      return p ? p.toDec().toString() : undefined;
    })();

    analyticsAmplitudeStore.logEvent("swap_quote_received", {
      request_id: requestIdRef.current,
      out_amount_est_raw: outAmountRaw.toString(),
      out_amount_est_usd: outUsd,
      slippage_bps: uiConfigStore.ibcSwapConfig.slippageNum * 100,
      provider: "skip",
      does_swap: queryRouteForLog.response.data.does_swap,
      txs_required: queryRouteForLog.response.data.operations?.length ?? 0,
      route_duration_estimate_sec:
        queryRouteForLog.response.data.estimated_route_duration_seconds,
      swap_venues: (
        queryRouteForLog.response.data.swap_venues ?? [
          queryRouteForLog.response.data.swap_venue,
        ]
      )
        .filter(Boolean)
        .map((v: any) => v.name ?? v.dex)
        .filter(Boolean),
    });
    prevRouteKeyRef.current = currentKey;
  }, [
    queryRouteForLog?.response,
    analyticsAmplitudeStore,
    outCurrency,
    priceStore,
    uiConfigStore.ibcSwapConfig.slippageNum,
    inChainId,
    outChainId,
    ibcSwapConfigs.amountConfig.swapPriceImpact,
    queryRouteForLog,
  ]);

  const logSwapSignOpened = useCallback(() => {
    analyticsAmplitudeStore.logEvent("swap_sign_opened", {
      request_id: requestIdRef.current,
      gas_estimate: ibcSwapConfigs.gasConfig.gas,
      price_impact_pct: ibcSwapConfigs.amountConfig.swapPriceImpact
        ? Number(
            ibcSwapConfigs.amountConfig.swapPriceImpact
              .toDec()
              .mul(new Dec(100))
              .toString()
          )
        : undefined,
      slippage_bps: uiConfigStore.ibcSwapConfig.slippageNum * 100,
    });
  }, [analyticsAmplitudeStore, ibcSwapConfigs, uiConfigStore]);

  return {
    requestId: requestIdRef.current,
    logSwapSignOpened,
  };
};
