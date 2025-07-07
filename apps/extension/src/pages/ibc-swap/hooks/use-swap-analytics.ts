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
  const { analyticsAmplitudeStore, uiConfigStore, priceStore, chainStore } =
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

  const aggregatedPropsRef = useRef<Record<string, Record<string, any>>>({});

  const durationRef = useRef<Record<string, { first: number; prev: number }>>(
    {}
  );

  const debouncedEventMapRef = useRef<
    Record<string, ReturnType<typeof debounce>>
  >({});

  const requestStartedAtRef = useRef<number | undefined>(undefined);

  const logEvent = useCallback(
    (eventName: string, props: Record<string, any> = {}) => {
      const id = props["quote_id"];

      let mergedProps = { ...props };

      const durationProps: Record<string, number> = {};

      if (milestoneEvents.has(eventName) && id) {
        const now = performance.now();
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
          ...durationProps,
          ...props,
        };
        mergedProps = aggregatedPropsRef.current[id];
      }

      if (!debouncedEventMapRef.current[eventName]) {
        debouncedEventMapRef.current[eventName] = debounce(
          (p: Record<string, any>) => {
            analyticsAmplitudeStore.logEvent(eventName, p);

            if (
              eventName === "swap_tx_success" ||
              eventName === "swap_tx_failed"
            ) {
              delete aggregatedPropsRef.current[id];
            }
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
    });
  });

  const inChainIdentifier = ChainIdHelper.parse(inChainId).identifier;
  const outChainIdentifier = ChainIdHelper.parse(outChainId).identifier;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inChainIdentifier, inCurrency.coinDenom]);

  // destination selected
  useEffect(() => {
    if (entryPoint !== "select_to_asset") return;

    if (
      prevOutRef.current.chainIdentifier !== outChainIdentifier ||
      prevOutRef.current.denom !== outCurrency.coinDenom
    ) {
      logEvent("swap_destination_selected", {
        out_chain_identifier: outChainIdentifier,
        out_coin_denom: outCurrency.coinDenom,
      });
      prevOutRef.current = {
        chainIdentifier: outChainIdentifier,
        denom: outCurrency.coinDenom,
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outChainIdentifier, outCurrency.coinDenom]);

  // MAX button clicked
  useEffect(() => {
    const currentFraction = ibcSwapConfigs.amountConfig.fraction;
    if (prevFractionRef.current !== currentFraction && currentFraction === 1) {
      logEvent("swap_max_btn_clicked");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    uiConfigStore.ibcSwapConfig.slippageNum,
    uiConfigStore.ibcSwapConfig.slippage,
    uiConfigStore.ibcSwapConfig.slippageIsCustom,
  ]);

  // Quote requested
  const queryIBCSwapForLog = ibcSwapConfigs.amountConfig.getQueryIBCSwap();
  const queryRouteForLog = queryIBCSwapForLog?.getQueryRoute();

  const amount = ibcSwapConfigs.amountConfig.amount[0];
  const inAmountRaw = amount.toCoin().amount.toString();
  const inAmountUsd = priceStore
    .calculatePrice(amount, "usd")
    ?.toDec()
    .toString();

  useEffect(() => {
    if (!queryRouteForLog || !amount) {
      prevFetchingRef.current = false;
      return;
    }

    if (!prevFetchingRef.current && queryRouteForLog.isFetching) {
      requestStartedAtRef.current = performance.now();
      logEvent("swap_quote_requested", {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryRouteForLog?.isFetching]);

  // Quote received
  useEffect(() => {
    if (!queryRouteForLog?.response) return;

    const {
      source_asset_denom,
      source_asset_chain_id,
      dest_asset_denom,
      dest_asset_chain_id,
      amount_in,
      amount_out,
    } = queryRouteForLog.response.data;
    const currentKey = `${source_asset_denom}-${source_asset_chain_id}-${dest_asset_denom}-${dest_asset_chain_id}-${amount_in}-${amount_out}`;
    if (prevRouteKeyRef.current === currentKey) return;

    const sourceChainIdentifier = ChainIdHelper.parse(
      source_asset_chain_id
    ).identifier;
    const sourceCurrency = chainStore
      .getChain(sourceChainIdentifier)
      .forceFindCurrency(source_asset_denom);
    const sourceCoinPretty = new CoinPretty(sourceCurrency, amount_in);
    const sourceAmountUsd = (() => {
      const p = priceStore.calculatePrice(sourceCoinPretty, "usd");
      return p ? p.toDec().toString() : undefined;
    })();

    const destChainIdentifier =
      ChainIdHelper.parse(dest_asset_chain_id).identifier;
    const destCurrency = chainStore
      .getChain(dest_asset_chain_id)
      .forceFindCurrency(dest_asset_denom);
    const destCoinPretty = new CoinPretty(destCurrency, amount_out);
    const destAmountUsd = (() => {
      const p = priceStore.calculatePrice(destCoinPretty, "usd");
      return p ? p.toDec().toString() : undefined;
    })();

    const quoteId = generateQuoteId();

    const durationMs = requestStartedAtRef.current
      ? performance.now() - requestStartedAtRef.current
      : undefined;
    requestStartedAtRef.current = undefined;

    logEvent("swap_quote_received", {
      quote_id: quoteId,
      duration_ms: durationMs,
      in_chain_identifier: sourceChainIdentifier,
      in_coin_denom: sourceCurrency.coinDenom,
      in_amount_raw: amount_in,
      in_amount_usd: sourceAmountUsd,
      out_chain_identifier: destChainIdentifier,
      out_coin_denom: destCurrency.coinDenom,
      out_amount_est_raw: amount_out,
      out_amount_est_usd: destAmountUsd,
      provider: "skip",
      does_swap: queryRouteForLog.response.data.does_swap,
      txs_required: queryRouteForLog.response.data.txs_required,
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
    quoteIdRef.current = quoteId;
    prevRouteKeyRef.current = currentKey;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryRouteForLog?.response]);

  // Quote failed
  useEffect(() => {
    if (!queryRouteForLog?.error) return;

    const durationMs = requestStartedAtRef.current
      ? performance.now() - requestStartedAtRef.current
      : undefined;
    requestStartedAtRef.current = undefined;

    logEvent("swap_quote_failed", {
      duration_ms: durationMs,
      in_chain_identifier: inChainIdentifier,
      in_coin_denom: inCurrency.coinDenom,
      out_chain_identifier: outChainIdentifier,
      out_coin_denom: outCurrency.coinDenom,
      in_amount_raw: inAmountRaw,
      in_amount_usd: inAmountUsd,
      provider: "skip",
      error_message:
        queryRouteForLog.error.message ?? queryRouteForLog.error.data?.message,
      error_status: queryRouteForLog.error.status,
      error_code: queryRouteForLog.error.data?.code ?? undefined,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryRouteForLog?.error]);

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
    quoteIdRef,
    logSwapSignOpened,
    logEvent,
  };
};
