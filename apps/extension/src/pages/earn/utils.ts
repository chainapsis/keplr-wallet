import { Currency, IBCCurrency } from "@keplr-wallet/types";

export function validateIsUsdcFromNoble(currency: Currency, chainId: string) {
  return (
    (currency.coinMinimalDenom === "uusdc" && chainId === "noble-1") ||
    (currency as IBCCurrency).originChainId === "noble-1"
  );
}
