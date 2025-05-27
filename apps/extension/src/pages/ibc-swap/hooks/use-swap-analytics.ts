import { useRef, useEffect, useCallback, useMemo } from "react";
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
import debounce from "lodash.debounce";

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
  const { analyticsAmplitudeStore, keyRingStore, uiConfigStore, priceStore } =
    useStore();

  const generateRequestId = () =>
    (crypto as any)?.randomUUID
      ? (crypto as any).randomUUID()
      : Math.random().toString(36).substring(2);

  const requestIdRef = useRef<string>(generateRequestId());

  const prevInRef = useRef<{ chainIdentifier: string; denom: string }>({
    chainIdentifier: "",
    denom: "",
  });
  const prevOutRef = useRef<{ chainIdentifier: string; denom: string }>({
    chainIdentifier: "",
    denom: "",
  });
  const prevFractionRef = useRef<number>(0);
  const prevSlippageRef = useRef<number>(
    uiConfigStore.ibcSwapConfig.slippageNum
  );
  const prevFetchingRef = useRef<boolean>(false);
  const prevRouteKeyRef = useRef<any>(undefined);
  const prevQuoteErrorIdRef = useRef<any>(undefined);

  const aggregatedPropsRef = useRef<Record<string, Record<string, any>>>({});

  const debouncedEventMapRef = useRef<
    Record<string, ReturnType<typeof debounce>>
  >({});

  const logEvent = useCallback(
    (eventName: string, props: Record<string, any>) => {
      const id = props["request_id"];

      let mergedProps = { ...props };
      if (id) {
        aggregatedPropsRef.current[id] = {
          ...aggregatedPropsRef.current[id],
          ...props,
        };
        mergedProps = aggregatedPropsRef.current[id];
      }

      if (!debouncedEventMapRef.current[eventName]) {
        debouncedEventMapRef.current[eventName] = debounce(
          (p: Record<string, any>) => {
            analyticsAmplitudeStore.logEvent(eventName, p);
          },
          100
        );
      }

      debouncedEventMapRef.current[eventName](mergedProps);
    },
    [analyticsAmplitudeStore]
  );

  const entryPoint = useMemo(() => {
    const entryPointParam = searchParams.get("entryPoint");
    if (!entryPointParam) return "direct";
    return entryPointParam;
  }, [searchParams]);

  // swap_entry (only once)
  useEffectOnce(() => {
    if (entryPoint === "select_from_asset" || entryPoint === "select_to_asset")
      return;

    logEvent("swap_entry", {
      entry_point: entryPoint,
      wallet_type: keyRingStore.selectedKeyInfo?.type,
    });
  });

  // source / destination selected
  useEffect(() => {
    if (entryPoint !== "select_from_asset") return;

    const inChainIdentifier = ChainIdHelper.parse(inChainId).identifier;
    if (
      prevInRef.current.chainIdentifier !== inChainIdentifier ||
      prevInRef.current.denom !== inCurrency.coinDenom
    ) {
      logEvent("swap_source_selected", {
        in_chain_identifier: inChainIdentifier,
        in_coin_denom: inCurrency.coinDenom,
      });
      prevInRef.current = {
        chainIdentifier: inChainIdentifier,
        denom: inCurrency.coinDenom,
      };
    }
  }, [inChainId, inCurrency.coinDenom, logEvent, entryPoint]);

  useEffect(() => {
    if (entryPoint !== "select_to_asset") return;

    const outChainIdentifier = ChainIdHelper.parse(outChainId).identifier;
    if (
      prevOutRef.current.chainIdentifier !== outChainIdentifier ||
      prevOutRef.current.denom !== outCurrency.coinMinimalDenom
    ) {
      logEvent("swap_destination_selected", {
        out_chain_identifier: outChainIdentifier,
        out_coin_denom: outCurrency.coinDenom,
      });
      prevOutRef.current = {
        chainIdentifier: outChainIdentifier,
        denom: outCurrency.coinMinimalDenom,
      };
    }
  }, [
    outChainId,
    outCurrency.coinMinimalDenom,
    outCurrency.coinDenom,
    logEvent,
    entryPoint,
  ]);

  // MAX button clicked
  useEffect(() => {
    const currentFraction = ibcSwapConfigs.amountConfig.fraction;
    if (prevFractionRef.current !== currentFraction && currentFraction === 1) {
      logEvent("swap_max_btn_clicked", {
        request_id: requestIdRef.current,
      });
    }
    prevFractionRef.current = currentFraction;
  }, [ibcSwapConfigs.amountConfig.fraction, analyticsAmplitudeStore, logEvent]);

  // Slippage changed
  useEffect(() => {
    const current = uiConfigStore.ibcSwapConfig.slippageNum;
    if (prevSlippageRef.current !== current) {
      logEvent("swap_slippage_changed", {
        slippage_bps: current * 100,
        button_clicked: uiConfigStore.ibcSwapConfig.slippageIsCustom
          ? "custom"
          : `${uiConfigStore.ibcSwapConfig.slippage}%`,
      });
      prevSlippageRef.current = current;
    }
  }, [
    uiConfigStore.ibcSwapConfig.slippageNum,
    uiConfigStore.ibcSwapConfig.slippage,
    uiConfigStore.ibcSwapConfig.slippageIsCustom,
    logEvent,
  ]);

  // Quote requested
  const queryIBCSwapForLog = ibcSwapConfigs.amountConfig.getQueryIBCSwap();
  const queryRouteForLog = queryIBCSwapForLog?.getQueryRoute();

  useEffect(() => {
    if (!queryRouteForLog) return;
    if (!prevFetchingRef.current && queryRouteForLog.isFetching) {
      requestIdRef.current = generateRequestId();

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

      const inChainIdentifier = ChainIdHelper.parse(inChainId).identifier;
      const outChainIdentifier = ChainIdHelper.parse(outChainId).identifier;

      logEvent("swap_quote_requested", {
        request_id: requestIdRef.current,
        in_chain_identifier: inChainIdentifier,
        in_coin_denom: inCurrency.coinDenom,
        out_chain_identifier: outChainIdentifier,
        out_coin_denom: outCurrency.coinDenom,
        in_amount_raw: inAmountRaw,
        in_amount_usd: inAmountUsd,
        swap_fee_bps: swapFeeBps,
      });
    }
    prevFetchingRef.current = queryRouteForLog.isFetching;
  }, [
    queryRouteForLog?.isFetching,
    analyticsAmplitudeStore,
    inCurrency,
    outCurrency,
    swapFeeBps,
    ibcSwapConfigs.amountConfig.amount,
    priceStore,
    queryRouteForLog,
    logEvent,
    inChainId,
    outChainId,
  ]);

  // Quote received
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

    logEvent("swap_quote_received", {
      request_id: requestIdRef.current,
      out_amount_est_raw: outAmountRaw,
      out_amount_est_usd: outUsd,
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
    outCurrency,
    priceStore,
    queryRouteForLog,
    logEvent,
  ]);

  // Quote failed
  useEffect(() => {
    if (!queryRouteForLog || !queryRouteForLog.error) return;

    if (prevQuoteErrorIdRef.current === requestIdRef.current) return;

    logEvent("swap_quote_failed", {
      request_id: requestIdRef.current,
      provider: "skip",
      error_message:
        queryRouteForLog.error.message ?? queryRouteForLog.error.toString(),
    });
    prevQuoteErrorIdRef.current = requestIdRef.current;
  }, [queryRouteForLog?.error, logEvent, queryRouteForLog]);

  const logSwapSignOpened = useCallback(() => {
    logEvent("swap_sign_opened", {
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
    });
  }, [
    logEvent,
    ibcSwapConfigs.gasConfig.gas,
    ibcSwapConfigs.amountConfig.swapPriceImpact,
  ]);

  return {
    requestId: requestIdRef.current,
    logSwapSignOpened,
    logEvent,
  };
};
