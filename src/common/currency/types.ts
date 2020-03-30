export interface FiatCurrency {
  currency: string;
  symbol: string;
  parse: (value: number) => string;
}
