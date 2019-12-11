import { BIP44 } from "@everett-protocol/cosmosjs/core/bip44";
import {
  Bech32Config,
  defaultBech32Config
} from "@everett-protocol/cosmosjs/core/bech32Config";

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
 * Currencis include the currency information for matched coin.
 */
export const Currencies: {
  readonly [currency: string]: Currency;
} = {
  atom: {
    coinDenom: "ATOM",
    coinMinimalDenom: "uatom",
    coinDecimals: 6,
    coinGeckoId: "cosmos"
  },
  luna: {
    coinDenom: "LUNA",
    coinMinimalDenom: "uluna",
    coinDecimals: 6,
    coinGeckoId: "luna"
  }
};

export function getCurrency(type: string): Currency | undefined {
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

export interface ChainInfo {
  readonly rpc: string;
  readonly rest: string;
  readonly chainId: string;
  readonly chainName: string;
  /**
   * This indicates the type of coin that can be used for stake.
   * You can get actual currency information from Currencies.
   */
  readonly nativeCurrency: string;
  readonly coinIconUrl: string;
  readonly walletUrl: string;
  readonly bip44: BIP44;
  readonly bech32Config: Bech32Config;

  readonly currencies: string[];
  /**
   * This indicates which coin or token can be used for fee to send transaction.
   * You can get actual currency information from Currencies.
   */
  readonly feeCurrencies: string[];
}

export const NativeChainInfos: ChainInfo[] = [
  {
    rpc: "http://localhost",
    rest: "http://localhost:1317",
    chainId: "cosmoshub-3",
    chainName: "Cosmos",
    nativeCurrency: "atom",
    coinIconUrl: require("assets/atom-icon.png"),
    walletUrl:
      process.env.NODE_ENV === "production"
        ? ""
        : "http://localhost:8081/#/cosmoshub-3",
    bip44: new BIP44(44, 118, 0),
    bech32Config: defaultBech32Config("cosmos"),
    currencies: ["atom"],
    feeCurrencies: ["atom"]
  },
  {
    rpc: "http://localhost:81",
    rest: "null",
    chainId: "columbus-2",
    chainName: "Terra",
    nativeCurrency: "luna",
    coinIconUrl: require("assets/luna-icon.svg"),
    walletUrl:
      process.env.NODE_ENV === "production"
        ? ""
        : "http://localhost:8081/#/columbus-2",
    bip44: new BIP44(44, 330, 0),
    bech32Config: defaultBech32Config("terra"),
    currencies: ["luna"],
    feeCurrencies: ["luna"] // TODO: krw, usd, sdr, mnt
  }
];

export interface AccessOrigin {
  chainId: string;
  origins: string[];
}

/**
 * This declares which origins can access extension without explicit approval.
 */
export const ExtensionAccessOrigins: AccessOrigin[] = [
  {
    chainId: "cosmoshub-2",
    origins: ["http://localhost:8081"]
  },
  {
    chainId: "columbus-2",
    origins: ["http://localhost:8081"]
  }
];
