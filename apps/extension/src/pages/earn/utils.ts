import { Currency, IBCCurrency } from "@keplr-wallet/types";

// TODO: 런칭시 메인넷으로 변경 필요
const NOBLE_CHAIN_ID = "duke-1"; // "noble-1";

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
