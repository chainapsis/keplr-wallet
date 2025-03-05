import { AppCurrency } from "@keplr-wallet/types";
import { NOBLE_CHAIN_ID } from "../../config.ui";

export function validateIsUsdcFromNoble(
  currency: AppCurrency,
  chainId: string
) {
  return (
    (currency.coinMinimalDenom === "uusdc" && chainId === NOBLE_CHAIN_ID) ||
    ("originChainId" in currency &&
      currency.originChainId === NOBLE_CHAIN_ID &&
      currency.originCurrency &&
      currency.originCurrency.coinMinimalDenom === "uusdc")
  );
}

export function validateIsUsdnFromNoble(
  currency: AppCurrency,
  chainId: string
) {
  return (
    (currency.coinMinimalDenom === "uusdn" && chainId === NOBLE_CHAIN_ID) ||
    ("originChainId" in currency &&
      currency.originChainId === NOBLE_CHAIN_ID &&
      currency.originCurrency &&
      currency.coinMinimalDenom === "uusdn")
  );
}
