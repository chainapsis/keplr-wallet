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
  kava: {
    coinDenom: "KAVA",
    coinMinimalDenom: "ukava",
    coinDecimals: 6,
    coinGeckoId: "kava"
  }
};

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
  readonly walletUrl: string;
  readonly walletUrlForStaking?: string;
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
    walletUrl:
      process.env.NODE_ENV === "production"
        ? ""
        : "http://localhost:8081/#/cosmoshub-3",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? ""
        : "http://localhost:8081/#/cosmoshub-3/stake",
    bip44: new BIP44(44, 118, 0),
    bech32Config: defaultBech32Config("cosmos"),
    currencies: ["atom"],
    feeCurrencies: ["atom"]
  },
  {
    rpc: "http://localhost:81",
    rest: "http://localhost:2317",
    chainId: "kava-2",
    chainName: "Kava",
    nativeCurrency: "kava",
    walletUrl:
      process.env.NODE_ENV === "production"
        ? ""
        : "http://localhost:8081/#/kava-2",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? ""
        : "http://localhost:8081/#/kava-2/stake",
    bip44: new BIP44(44, 118, 0),
    bech32Config: defaultBech32Config("kava"),
    currencies: ["kava"],
    feeCurrencies: ["kava"]
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
    chainId: "cosmoshub-3",
    origins: ["http://localhost:8081"]
  },
  {
    chainId: "kava-2",
    origins: ["http://localhost:8081"]
  }
];
