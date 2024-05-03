/**
 * A Denomination Unit
 *
 * This metadata allows clients to correctly display currency values
 */
export interface DenomUnit {
  /**
   * The name of the unit
   */
  name: string;

  /**
   * The exponent for the number of units in the form 10^{exponent}.
   *
   * For FET which has a precision of 10^18 this value would be 18
   */
  exponent: number;

  /**
   * An optional set of aliases for the unit
   */
  aliases?: string[];
}

/**
 * A base currency type for the wallet.
 *
 * Since a network can target multiple currencies each with some different attributes. Users must inspect the `type`
 * field in order to determine the correct concrete type for this object
 */
export interface BaseCurrency {
  /**
   * The currency type field
   */
  readonly type: "native" | "cw20" | "ibc" | "erc20";

  /**
   * An optional description for the currency
   */
  readonly description?: string;

  /**
   * The set of units that are applicable for this currency.
   */
  readonly denomUnits: DenomUnit[];

  /**
   * The display name for the currency
   */
  readonly display: string;

  /**
   * The canonical name for the currency
   */
  readonly name: string;

  /**
   * The canonical symbol for the currency
   */
  readonly decimals: number;

  /**
   * This is used to fetch asset's fiat value from coingecko.
   * You can get id from https://api.coingecko.com/api/v3/coins/list.
   */
  readonly coinGeckoId?: string;

  /**
   * The optional URL for the currency image
   */
  readonly imageUrl?: string;
}

/**
 * The concrete type for a native currency
 */
export interface NativeCurrency extends BaseCurrency {
  /**
   * The type id for the currency
   */
  readonly type: "native";

  /**
   * The canonical denomination for the currency
   */
  readonly denom: string;
}

/**
 * Determines if the input currency is a Native currency
 *
 * @param currency The input currency to be checked
 */
export function isNativeCurrency(
  currency: BaseCurrency
): currency is NativeCurrency {
  return currency.type === "native";
}

/**
 * The concrete type for a CW20 (contract based) currency
 */
export interface CW20Currency extends BaseCurrency {
  /**
   * The type id for the currency
   */
  readonly type: "cw20";

  /**
   * The contract address for the currency
   */
  readonly contractAddress: string;
}

export interface ERC20Currency extends BaseCurrency {
  /**
   * The type id for the currency
   */
  readonly type: "erc20";

  /**
   * The contract address for the currency
   */
  readonly contractAddress: string;
}

/**
 * Determines if the input currency is a CW20 currency
 *
 * @param currency The input currency to be checked
 */
export function isCw20Currency(
  currency: BaseCurrency
): currency is CW20Currency {
  return currency.type === "cw20";
}

export function isErc20Currency(
  currency: BaseCurrency
): currency is CW20Currency {
  return currency.type === "erc20";
}

/**
 * The IBC Path object represents the route by which data was transferred to the current chcain
 */
export interface IbcPath {
  /**
   * The IBC port id
   */
  portId: string;

  /**
   * The IBC channel id
   */
  channelId: string;
}

/**
 * The concrete type for an IBC currency
 *
 * An IBCCurrency is the currency that is sent from the other chain via IBC. This will be handled as similar to the
 * native currency. However, additional information is required about the IBC channels and paths that were used.
 */
export interface IBCCurrency extends BaseCurrency {
  /**
   * The currency type id
   */
  readonly type: "ibc";

  /**
   * The IBC paths associated with this currency
   */
  readonly paths: IbcPath[];

  /**
   * The chain id that the currency is from if known
   */
  readonly originChainId: string | undefined;

  /**
   * the origin currency if known
   */
  readonly originCurrency: NativeCurrency | CW20Currency | undefined;
}

/**
 * A type alias representing all possible concrete currency types
 */
export type Currency =
  | NativeCurrency
  | IBCCurrency
  | CW20Currency
  | ERC20Currency;
