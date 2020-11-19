import { FiatCurrency } from "./types";
import { FiatCurrencies } from "../../config";

let LanguageToFiatCurrency:
  | {
      [language: string]: FiatCurrency;
    }
  | undefined;

export function init(_fiatCurrencies: { [language: string]: FiatCurrency }) {
  LanguageToFiatCurrency = _fiatCurrencies;
}

export function setManualFiatCurrency(fiatCurrency: FiatCurrency | null) {
  if (!fiatCurrency) {
    localStorage.removeItem("fiat-currency");
    return;
  }
  localStorage.setItem("fiat-currency", fiatCurrency.currency);
}

export function getManualFiatCurrency(): FiatCurrency | null {
  const currency = localStorage.getItem("fiat-currency");
  if (!currency) {
    return null;
  }
  return FiatCurrencies[currency];
}

export function getFiatCurrencyFromLanguage(language: string): FiatCurrency {
  if (!LanguageToFiatCurrency) {
    throw new Error("Not initialized");
  }

  const manual = getManualFiatCurrency();
  if (manual) {
    return manual;
  }

  let currency = LanguageToFiatCurrency[language];
  if (!currency) {
    currency = LanguageToFiatCurrency["default"];
  }
  if (!currency) {
    throw new Error("Invalid fiat currency");
  }
  return currency;
}

export * from "./types";
