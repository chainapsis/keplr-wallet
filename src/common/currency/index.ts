import { Currency, FiatCurrency } from "./types";

let Currencies:
  | {
      readonly [currency: string]: Currency;
    }
  | undefined;

let LanguageToFiatCurrency:
  | {
      [language: string]: FiatCurrency;
    }
  | undefined;

export function init(
  _currencies: {
    readonly [currency: string]: Currency;
  },
  _fiatCurrencies: {
    [language: string]: FiatCurrency;
  }
) {
  Currencies = _currencies;
  LanguageToFiatCurrency = _fiatCurrencies;
}

export function getCurrency(type: string): Currency | undefined {
  if (!Currencies) {
    throw new Error("Not initialized");
  }

  return Currencies[type];
}

export function getCurrencies(types: string[]): Currency[] {
  const currencies: Currency[] = [];
  // Guard
  if (!types) {
    return currencies;
  }

  for (const type of types) {
    const currency = getCurrency(type);
    if (currency) {
      currencies.push(currency);
    }
  }

  return currencies;
}

export function getCurrencyFromDenom(denom: string): Currency | undefined {
  if (!denom) {
    return undefined;
  }

  const currencies = getCurrenciesFromDenoms([denom]);
  if (currencies.length >= 1) {
    return currencies[0];
  }
  return undefined;
}

export function getCurrenciesFromDenoms(denoms: string[]): Currency[] {
  const currencies: Currency[] = [];
  // Guard
  if (!denoms) {
    return currencies;
  }

  for (const key in Currencies) {
    const currency = Currencies[key];
    if (denoms.indexOf(currency.coinDenom) >= 0) {
      currencies.push(currency);
    }
  }

  return currencies;
}

export function getCurrencyFromMinimalDenom(
  denom: string
): Currency | undefined {
  if (!denom) {
    return undefined;
  }

  const currencies = getCurrenciesFromMinimalDenoms([denom]);
  if (currencies.length >= 1) {
    return currencies[0];
  }
  return undefined;
}

export function getCurrenciesFromMinimalDenoms(denoms: string[]): Currency[] {
  const currencies: Currency[] = [];
  // Guard
  if (!denoms) {
    return currencies;
  }

  for (const key in Currencies) {
    const currency = Currencies[key];
    if (denoms.indexOf(currency.coinMinimalDenom) >= 0) {
      currencies.push(currency);
    }
  }

  return currencies;
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
