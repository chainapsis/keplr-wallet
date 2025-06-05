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

const generateQuoteId = () => {
  try {
    return crypto.randomUUID();
  } catch (error) {
    return `${Date.now()}-${Math.random().toString(36).substring(2)}`;
  }
};

const milestoneEvents = new Set([
  "swap_quote_requested",
  "swap_quote_received",
  "swap_sign_opened",
  "swap_tx_submitted",
  "swap_tx_success",
  "swap_tx_failed",
]);

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

  const quoteIdRef = useRef("");

  const prevInRef = useRef({
    chainIdentifier: "",
    denom: "",
  });
  const prevOutRef = useRef({
    chainIdentifier: "",
    denom: "",
  });
  const prevFractionRef = useRef(0);
  const prevSlippageRef = useRef(uiConfigStore.ibcSwapConfig.slippageNum);
  const prevFetchingRef = useRef(false);
  const prevRouteKeyRef = useRef("");
  const prevQuoteErrorIdRef = useRef("");

  const aggregatedPropsRef = useRef<Record<string, Record<string, any>>>({});

  const durationRef = useRef<Record<string, { first: number; prev: number }>>(
    {}
  );

  const debouncedEventMapRef = useRef<
    Record<string, ReturnType<typeof debounce>>
  >({});

  const inChainIdentifier = ChainIdHelper.parse(inChainId).identifier;
  const outChainIdentifier = ChainIdHelper.parse(outChainId).identifier;

  const logEvent = useCallback(
    (eventName: string, props: Record<string, any>) => {
      const id = props["quote_id"];

      let mergedProps = { ...props };

      const durationProps: Record<string, number> = {};

      if (milestoneEvents.has(eventName) && id) {
        const now = Date.now();
        if (eventName === "swap_quote_requested" || !durationRef.current[id]) {
          durationRef.current[id] = { first: now, prev: now };
        }

        if (eventName !== "swap_quote_requested") {
          const duration = now - durationRef.current[id].prev;
          durationProps["duration_ms"] = duration;
          durationRef.current[id].prev = now;
        }

        if (eventName === "swap_tx_success" || eventName === "swap_tx_failed") {
          durationProps["total_duration_ms"] =
            now - durationRef.current[id].first;
          delete durationRef.current[id];
        }
      }

      if (id) {
        aggregatedPropsRef.current[id] = {
          ...aggregatedPropsRef.current[id],
          ...props,
          ...durationProps,
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

  // source selected
  useEffect(() => {
    if (entryPoint !== "select_from_asset") return;

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
  }, [inChainIdentifier, inCurrency.coinDenom, logEvent, entryPoint]);

  // destination selected
  useEffect(() => {
    if (entryPoint !== "select_to_asset") return;

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
    outChainIdentifier,
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
        quote_id: quoteIdRef.current,
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
  const queryMsgsDirectForLog = queryIBCSwapForLog?.getQueryMsgsDirect();

  useEffect(() => {
    const amount = ibcSwapConfigs.amountConfig.amount[0];

    if (!queryMsgsDirectForLog || !amount) {
      prevFetchingRef.current = false;
      return;
    }

    if (!prevFetchingRef.current && queryMsgsDirectForLog.isFetching) {
      quoteIdRef.current = generateQuoteId();

      const inAmountRaw = amount.toCoin().amount.toString();
      const inAmountUsd = priceStore
        .calculatePrice(amount, "usd")
        ?.toDec()
        .toString();

      logEvent("swap_quote_requested", {
        quote_id: quoteIdRef.current,
        in_chain_identifier: inChainIdentifier,
        in_coin_denom: inCurrency.coinDenom,
        out_chain_identifier: outChainIdentifier,
        out_coin_denom: outCurrency.coinDenom,
        in_amount_raw: inAmountRaw,
        in_amount_usd: inAmountUsd,
        swap_fee_bps: swapFeeBps,
      });
    }
    prevFetchingRef.current = queryMsgsDirectForLog.isFetching;
  }, [
    queryMsgsDirectForLog,
    queryMsgsDirectForLog?.isFetching,
    inCurrency,
    outCurrency,
    swapFeeBps,
    ibcSwapConfigs.amountConfig.amount,
    priceStore.calculatePrice,
    logEvent,
    inChainIdentifier,
    outChainIdentifier,
  ]);

  // Quote received
  useEffect(() => {
    if (!queryMsgsDirectForLog?.response) return;

    const currentKey = queryMsgsDirectForLog.response.data.route.amount_out;
    if (prevRouteKeyRef.current === currentKey) return;

    const outAmountRaw = queryMsgsDirectForLog.response.data.route.amount_out;
    const outCoinPretty = new CoinPretty(outCurrency, outAmountRaw.toString());
    const outUsd = (() => {
      const p = priceStore.calculatePrice(outCoinPretty, "usd");
      return p ? p.toDec().toString() : undefined;
    })();

    logEvent("swap_quote_received", {
      quote_id: quoteIdRef.current,
      out_amount_est_raw: outAmountRaw,
      out_amount_est_usd: outUsd,
      provider: "skip",
      does_swap: queryMsgsDirectForLog.response.data.route.does_swap,
      txs_required: queryMsgsDirectForLog.response.data.route.txs_required,
      route_duration_estimate_sec:
        queryMsgsDirectForLog.response.data.route
          .estimated_route_duration_seconds,
      swap_venues: (
        queryMsgsDirectForLog.response.data.route.swap_venues ?? [
          queryMsgsDirectForLog.response.data.route.swap_venue,
        ]
      )
        .filter(Boolean)
        .map((v: any) => v.name ?? v.dex)
        .filter(Boolean),
    });
    prevRouteKeyRef.current = currentKey;
  }, [
    queryMsgsDirectForLog?.response,
    outCurrency,
    priceStore.calculatePrice,
    logEvent,
  ]);

  // Quote failed
  useEffect(() => {
    if (!queryMsgsDirectForLog || !queryMsgsDirectForLog.error) return;

    if (prevQuoteErrorIdRef.current === quoteIdRef.current) return;

    logEvent("swap_quote_failed", {
      quote_id: quoteIdRef.current,
      provider: "skip",
      error_message:
        queryMsgsDirectForLog.error.message ??
        queryMsgsDirectForLog.error.toString(),
    });
    prevQuoteErrorIdRef.current = quoteIdRef.current;
  }, [queryMsgsDirectForLog?.error, logEvent, queryMsgsDirectForLog]);

  const logSwapSignOpened = useCallback(() => {
    logEvent("swap_sign_opened", {
      quote_id: quoteIdRef.current,
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

  useEffect(() => {
    const debouncedFunctions = debouncedEventMapRef.current;

    return () => {
      Object.values(debouncedFunctions).forEach((debouncedFn) => {
        debouncedFn.cancel();
      });
    };
  }, []);

  return {
    quoteId: quoteIdRef.current,
    logSwapSignOpened,
    logEvent,
  };
};
