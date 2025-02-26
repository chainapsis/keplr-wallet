import { Currency, IBCCurrency } from "@keplr-wallet/types";
import { NOBLE_CHAIN_ID } from "../../config.ui";

export function validateIsUsdcFromNoble(currency: Currency, chainId: string) {
  return (
    (currency.coinMinimalDenom === "uusdc" && chainId === NOBLE_CHAIN_ID) ||
    (currency as IBCCurrency).originChainId === NOBLE_CHAIN_ID
  );
}

export function validateIsUsdnFromNoble(currency: Currency, chainId: string) {
  return (
    (currency.coinMinimalDenom === "uusdn" && chainId === NOBLE_CHAIN_ID) ||
    (currency as IBCCurrency).originChainId === NOBLE_CHAIN_ID
  );
}
