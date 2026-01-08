import { useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SwapAmountConfig } from "@keplr-wallet/hooks-internal";

/**
 * Hook to manage swap-related query parameters.
 * Handles:
 * - Syncing outChainId/outCurrency to query params
 * - Processing tempSwitchAmount for currency switching
 * - Resetting amount when initialAmount is removed from query params (after swap completion)
 *
 * Note: Call useSwapInitParams before this hook to get initial chain/currency values.
 */
export const useSwapQueryParams = (
  swapAmountConfig: SwapAmountConfig,
  isSwapExecuting: boolean
): {
  setSearchParams: ReturnType<typeof useSearchParams>[1];
  clearInitialAmount: () => void;
} => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Sync outChainId and outCurrency to search params
  useEffect(() => {
    setSearchParams(
      (prev) => {
        if (swapAmountConfig.outChainId) {
          prev.set("outChainId", swapAmountConfig.outChainId);
        } else {
          prev.delete("outChainId");
        }
        if (swapAmountConfig.outCurrency.coinMinimalDenom) {
          prev.set(
            "outCoinMinimalDenom",
            swapAmountConfig.outCurrency.coinMinimalDenom
          );
        } else {
          prev.delete("outCoinMinimalDenom");
        }

        return prev;
      },
      {
        replace: true,
      }
    );
  }, [
    swapAmountConfig.outChainId,
    swapAmountConfig.outCurrency.coinMinimalDenom,
    setSearchParams,
  ]);

  // Handle tempSwitchAmount (used when switching in/out currencies)
  const tempSwitchAmount = searchParams.get("tempSwitchAmount");
  useEffect(() => {
    if (tempSwitchAmount != null) {
      swapAmountConfig.setValue(tempSwitchAmount);
      setSearchParams((prev) => {
        prev.delete("tempSwitchAmount");
        return prev;
      });
    }
  }, [swapAmountConfig, setSearchParams, tempSwitchAmount]);

  // Reset amount when initialAmount query param is removed (e.g., after swap completion)
  useEffect(() => {
    const hasInitialAmount =
      searchParams.has("initialAmount") ||
      searchParams.has("initialAmountFraction");

    // If initialAmount is not in query params, current value exists, and swap is not executing, reset
    if (
      !hasInitialAmount &&
      swapAmountConfig.value.length > 0 &&
      !isSwapExecuting
    ) {
      swapAmountConfig.setValue("");
    }
  }, [searchParams, swapAmountConfig, isSwapExecuting]);

  // Clear initialAmount from query params (called on swap success)
  const clearInitialAmount = useCallback(() => {
    setSearchParams(
      (prev) => {
        prev.delete("initialAmount");
        prev.delete("initialAmountFraction");
        return prev;
      },
      { replace: true }
    );
  }, [setSearchParams]);

  return {
    setSearchParams,
    clearInitialAmount,
  };
};
