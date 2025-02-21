export interface NobleSwapRate {
  // Denomination of the base currency.
  denom: string;

  // Denomination of the counter currency.
  vs: string;

  // Exchange rate between the base and counter currency.
  price: string;

  // Algorithm of the underlying Pool used for the calculation.
  algorithm: string;
}
