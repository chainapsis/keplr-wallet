/**
 * The currency that is supported on the chain natively.
 */
export interface Currency {
  coinDenom: string;
  coinMinimalDenom: string;
  coinDecimals: number;
  /**
   * This is used to fetch asset's fiat value from coingecko.
   * You can get id from https://api.coingecko.com/api/v3/coins/list.
   */
  coinGeckoId?: string;
}

/**
 * The currency that is supported on the cosmwasm.
 * This should be the CW-20 that confirms the standard.
 * And, in this case, `coinMinimalDenom` must start with the type and contract address of currency such as "cw20:coral1vv6hruqu...3sfhwh:ukeplr".
 */
export interface CW20Currency extends Currency {
  type: "cw20";
  contractAddress: string;
}

export interface Secret20Currency extends Currency {
  type: "secret20";
  contractAddress: string;
  viewingKey: string;
}

/**
 * Any type of currency that Kepler applications can support.
 */
export type AppCurrency = Currency | CW20Currency | Secret20Currency;

export interface FiatCurrency {
  currency: string;
  symbol: string;
  parse: (value: number) => string;
}
