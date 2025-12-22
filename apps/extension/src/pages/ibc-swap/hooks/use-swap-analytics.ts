import { useRef, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useEffectOnce } from "../../../hooks/use-effect-once";
import { useStore } from "../../../stores";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { AppCurrency } from "@keplr-wallet/types";
import { SwapAmountConfig } from "@keplr-wallet/hooks-internal";
import { FeeConfig, GasConfig, SenderConfig } from "@keplr-wallet/hooks";
import { RouteStepType, SwapProvider } from "@keplr-wallet/stores-internal";
import debounce from "lodash.debounce";
import { v4 as uuidv4 } from "uuid";

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
  swapConfigs: {
    amountConfig: SwapAmountConfig;
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
  swapConfigs,
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

  const inChainName = chainStore.hasChain(inChainId)
    ? chainStore.getChain(inChainId).chainName
    : undefined;
  const outChainName = chainStore.hasChain(outChainId)
    ? chainStore.getChain(outChainId).chainName
    : undefined;

  // source selected
  useEffect(() => {
    if (entryPoint !== "select_from_asset") return;

    if (
      prevInRef.current.chainIdentifier !== inChainIdentifier ||
      prevInRef.current.denom !== inCurrency.coinDenom
    ) {
      logEvent("swap_source_selected", {
        in_chain_identifier: inChainIdentifier,
        in_chain_name: inChainName,
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
        out_chain_name: outChainName,
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
    const currentFraction = swapConfigs.amountConfig.fraction;
    if (prevFractionRef.current !== currentFraction && currentFraction === 1) {
      logEvent("swap_max_btn_clicked");
    }
    prevFractionRef.current = currentFraction;
  }, [swapConfigs.amountConfig.fraction, analyticsAmplitudeStore, logEvent]);

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
  const queryRouteForLog = swapConfigs.amountConfig.getQueryRoute();

  const amount = swapConfigs.amountConfig.amount[0];
  const inAmountRaw = amount?.toCoin().amount.toString();
  const inAmountUsd = amount
    ? priceStore.calculatePrice(amount, "usd")?.toDec().toString()
    : undefined;

  useEffect(() => {
    if (!queryRouteForLog || !amount) {
      prevFetchingRef.current = false;
      return;
    }

    if (!prevFetchingRef.current && queryRouteForLog.isFetching) {
      requestStartedAtRef.current = performance.now();
      logEvent("swap_quote_requested", {
        in_chain_identifier: inChainIdentifier,
        in_chain_name: inChainName,
        in_coin_denom: inCurrency.coinDenom,
        out_chain_identifier: outChainIdentifier,
        out_chain_name: outChainName,
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

    const { fromChainId, fromDenom, fromAmount, toChainId, toDenom } =
      queryRouteForLog;
    const { amount_out, estimated_time, steps, provider } =
      queryRouteForLog.response.data;

    const currentKey = `${fromDenom}-${fromChainId}-${toDenom}-${toChainId}-${fromAmount}-${amount_out}`;
    if (prevRouteKeyRef.current === currentKey) return;

    const {
      chainIdentifier: sourceChainIdentifier,
      chainName: sourceChainName,
      coinDenom: sourceCoinDenom,
      amountUsd: sourceAmountUsd,
    } = getChainProperties(
      chainStore,
      priceStore,
      fromChainId,
      fromDenom,
      fromAmount
    );

    const {
      chainIdentifier: destChainIdentifier,
      chainName: destChainName,
      coinDenom: destCoinDenom,
      amountUsd: destAmountUsd,
    } = getChainProperties(
      chainStore,
      priceStore,
      toChainId,
      toDenom,
      amount_out
    );

    const doesSwap = steps.some((step) => step.type === RouteStepType.SWAP);

    const responseData = queryRouteForLog.response.data;
    let swapVenues: string[] | undefined;
    if (responseData.provider === SwapProvider.SKIP) {
      const venueSet = new Set<string>();
      for (const op of responseData.skip_operations) {
        if ("swap" in op && op.swap.swap_venues) {
          for (const venue of op.swap.swap_venues) {
            if (venue.name) venueSet.add(venue.name);
          }
        }
        if ("evm_swap" in op && op.evm_swap.swap_venues) {
          for (const venue of op.evm_swap.swap_venues) {
            if (venue.name) venueSet.add(venue.name);
          }
        }
      }
      if (venueSet.size > 0) {
        swapVenues = Array.from(venueSet);
      }
    }

    const quoteId = uuidv4();

    const durationMs = requestStartedAtRef.current
      ? performance.now() - requestStartedAtRef.current
      : undefined;
    requestStartedAtRef.current = undefined;

    logEvent("swap_quote_received", {
      quote_id: quoteId,
      duration_ms: durationMs,
      in_chain_identifier: sourceChainIdentifier,
      in_chain_name: sourceChainName,
      in_coin_denom: sourceCoinDenom,
      in_amount_raw: fromAmount,
      in_amount_usd: sourceAmountUsd,
      out_chain_identifier: destChainIdentifier,
      out_chain_name: destChainName,
      out_coin_denom: destCoinDenom,
      out_amount_est_raw: amount_out,
      out_amount_est_usd: destAmountUsd,
      provider,
      does_swap: doesSwap,
      route_duration_estimate_sec: estimated_time,
      swap_venues: swapVenues,
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

    const errorData = queryRouteForLog.error.data as
      | { message?: string; code?: number }
      | undefined;

    logEvent("swap_quote_failed", {
      duration_ms: durationMs,
      in_chain_identifier: inChainIdentifier,
      in_chain_name: inChainName,
      in_coin_denom: inCurrency.coinDenom,
      out_chain_identifier: outChainIdentifier,
      out_chain_name: outChainName,
      out_coin_denom: outCurrency.coinDenom,
      in_amount_raw: inAmountRaw,
      in_amount_usd: inAmountUsd,
      error_message: queryRouteForLog.error.message ?? errorData?.message,
      error_status: queryRouteForLog.error.status,
      error_code: errorData?.code ?? undefined,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryRouteForLog?.error]);

  const logSwapSignOpened = useCallback(
    (isOneClickSwap: boolean) => {
      logEvent("swap_sign_opened", {
        quote_id: quoteIdRef.current,
        gas_estimate: swapConfigs.gasConfig.gas,
        price_impact_pct: swapConfigs.amountConfig.swapPriceImpact
          ? Number(
              swapConfigs.amountConfig.swapPriceImpact
                .toDec()
                .mul(new Dec(100))
                .toString()
            )
          : undefined,
        is_one_click_swap: isOneClickSwap,
      });
    },
    [
      logEvent,
      swapConfigs.gasConfig.gas,
      swapConfigs.amountConfig.swapPriceImpact,
    ]
  );

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

type SwapChainAnalytics = {
  chainIdentifier: string;
  chainName: string;
  coinDenom: string;
  amountUsd?: string;
};

function getChainProperties(
  chainStore: ReturnType<typeof useStore>["chainStore"],
  priceStore: ReturnType<typeof useStore>["priceStore"],
  chainId: string,
  denom: string,
  amount: string
): SwapChainAnalytics {
  const _chainIdentifier = ChainIdHelper.parse(chainId).identifier;
  const chainIdentifier = Number.isNaN(parseInt(_chainIdentifier, 10))
    ? _chainIdentifier
    : `eip155:${_chainIdentifier}`;
  const chain = chainStore.hasChain(chainIdentifier)
    ? chainStore.getChain(chainIdentifier)
    : undefined;

  if (!chain) {
    return {
      chainIdentifier,
      chainName: chainId,
      coinDenom: denom,
    };
  }

  const currency = chain.forceFindCurrency(denom);
  const price = priceStore.calculatePrice(
    new CoinPretty(currency, amount),
    "usd"
  );

  return {
    chainIdentifier,
    chainName: chain.chainName,
    coinDenom: currency.coinDenom,
    amountUsd: price ? price.toDec().toString() : undefined,
  };
}
