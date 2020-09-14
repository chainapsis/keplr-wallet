import { FiatCurrency } from "./types";

let LanguageToFiatCurrency:
  | {
      [language: string]: FiatCurrency;
    }
  | undefined;

export function init(_fiatCurrencies: { [language: string]: FiatCurrency }) {
  LanguageToFiatCurrency = _fiatCurrencies;
}

export function getFiatCurrencyFromLanguage(language: string): FiatCurrency {
  if (!LanguageToFiatCurrency) {
    throw new Error("Not initialized");
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
