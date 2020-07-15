import { Currency, FiatCurrency } from "./common/currency";
import { BIP44 } from "@everett-protocol/cosmosjs/core/bip44";
import { defaultBech32Config } from "@everett-protocol/cosmosjs/core/bech32Config";
import { ChainInfo, AccessOrigin } from "./background/chains";

import {
  COSMOS_REST_CONFIG,
  COSMOS_REST_ENDPOINT,
  COSMOS_RPC_CONFIG,
  COSMOS_RPC_ENDPOINT,
  ETHEREUM_ENDPOINT,
  KAVA_REST_CONFIG,
  KAVA_REST_ENDPOINT,
  KAVA_RPC_CONFIG,
  KAVA_RPC_ENDPOINT,
  SECRET_NETWORK_REST_CONFIG,
  SECRET_NETWORK_REST_ENDPOINT,
  SECRET_NETWORK_RPC_CONFIG,
  SECRET_NETWORK_RPC_ENDPOINT
} from "./config.var";

export const CoinGeckoAPIEndPoint = "https://api.coingecko.com/api/v3";
export const CoinGeckoGetPrice = "/simple/price";
export const AutoFetchingFiatValueInterval = 300 * 1000; // 5min

export const AutoFetchingAssetsInterval = 15 * 1000; // 15sec

// Endpoint for Ethereum node.
// This is used for ENS.
export const EthereumEndpoint = ETHEREUM_ENDPOINT;

export const EmbedChainInfos: ChainInfo[] = [
  {
    rpc: COSMOS_RPC_ENDPOINT,
    rpcConfig: COSMOS_RPC_CONFIG,
    rest: COSMOS_REST_ENDPOINT,
    restConfig: COSMOS_REST_CONFIG,
    chainId: "cosmoshub-3",
    chainName: "Cosmos",
    nativeCurrency: "atom",
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/cosmoshub-3"
        : "http://localhost:8081/#/cosmoshub-3",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/cosmoshub-3"
        : "http://localhost:8081/#/cosmoshub-3",
    bip44: new BIP44(44, 118, 0),
    bech32Config: defaultBech32Config("cosmos"),
    currencies: ["atom"],
    feeCurrencies: ["atom"],
    coinType: 118
  },
  {
    rpc: KAVA_RPC_ENDPOINT,
    rpcConfig: KAVA_RPC_CONFIG,
    rest: KAVA_REST_ENDPOINT,
    restConfig: KAVA_REST_CONFIG,
    chainId: "kava-3",
    chainName: "Kava",
    nativeCurrency: "kava",
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/kava-3"
        : "http://localhost:8081/#/kava-3",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/kava-3"
        : "http://localhost:8081/#/kava-3",
    bip44: new BIP44(44, 118, 0),
    bech32Config: defaultBech32Config("kava"),
    currencies: ["kava"],
    feeCurrencies: ["kava"],
    coinType: 459
  },
  {
    rpc: SECRET_NETWORK_RPC_ENDPOINT,
    rpcConfig: SECRET_NETWORK_RPC_CONFIG,
    rest: SECRET_NETWORK_REST_ENDPOINT,
    restConfig: SECRET_NETWORK_REST_CONFIG,
    chainId: "secret-1",
    chainName: "Secret Network",
    nativeCurrency: "secret",
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/kava-3"
        : "http://localhost:8081/#/kava-3",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/kava-3"
        : "http://localhost:8081/#/kava-3",
    bip44: new BIP44(44, 118, 0),
    bech32Config: defaultBech32Config("secret"),
    currencies: ["secret"],
    feeCurrencies: ["secret"],
    coinType: 529
  }
];

/**
 * This declares which origins can access extension without explicit approval.
 */
export const EmbedAccessOrigins: AccessOrigin[] = [
  {
    chainId: "cosmoshub-3",
    origins:
      process.env.NODE_ENV === "production" ? ["https://wallet.keplr.app"] : []
  },
  {
    chainId: "kava-3",
    origins:
      process.env.NODE_ENV === "production" ? ["https://wallet.keplr.app"] : []
  },
  {
    chainId: "secret-1",
    origins:
      process.env.NODE_ENV === "production" ? ["https://wallet.keplr.app"] : []
  }
];

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
  },
  secret: {
    coinDenom: "SCRT",
    coinMinimalDenom: "uscrt",
    coinDecimals: 6
  }
};

export const LanguageToFiatCurrency: {
  [language: string]: FiatCurrency;
} = {
  default: {
    currency: "usd",
    symbol: "$",
    parse: (value: number) => {
      let fractionDigits = 2;
      if (value < 0.01) {
        fractionDigits = 4;
      }
      return value.toLocaleString("en-US", {
        maximumFractionDigits: fractionDigits
      });
    }
  },
  ko: {
    currency: "krw",
    symbol: "￦",
    parse: (value: number) => {
      let fractionDigits = 0;
      if (value < 1) {
        fractionDigits = 1;
      }
      return value.toLocaleString("ko-KR", {
        maximumFractionDigits: fractionDigits
      });
    }
  }
};
