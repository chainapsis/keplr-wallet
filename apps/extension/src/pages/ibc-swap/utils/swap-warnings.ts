import { AppCurrency } from "@keplr-wallet/types";
import {
  validateIsUsdcFromNoble,
  validateIsUsdnFromNoble,
} from "../../earn/utils";

export const getSwapWarnings = (
  currency: AppCurrency,
  chainId: string,
  outCurrency: AppCurrency,
  outChainId: string,
  celestiaDisabled: boolean
): {
  showUSDNWarning: boolean;
  showCelestiaWarning: boolean;
} => {
  const showUSDNWarning = (() => {
    if (validateIsUsdcFromNoble(currency, chainId)) {
      if (validateIsUsdnFromNoble(outCurrency, outChainId)) {
        return true;
      }
    }
    if (validateIsUsdnFromNoble(currency, chainId)) {
      if (validateIsUsdcFromNoble(outCurrency, outChainId)) {
        return true;
      }
    }
    return false;
  })();

  const showCelestiaWarning = (() => {
    if (celestiaDisabled) {
      return chainId === "celestia" || outChainId === "celestia";
    }
    return false;
  })();

  return {
    showUSDNWarning,
    showCelestiaWarning,
  };
};
