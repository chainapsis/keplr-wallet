import React from "react";

import { Currency, FiatCurrency } from "./common/currency";
import { BIP44 } from "@chainapsis/cosmosjs/core/bip44";
import { defaultBech32Config } from "@chainapsis/cosmosjs/core/bech32Config";
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
  SECRET_NETWORK_RPC_ENDPOINT,
  ADDITIONAL_SIGN_IN_PREPEND,
  ADDITIONAL_INTL_MESSAGES,
  BETA_CYBER_NETWORK_REST_ENDPOINT,
  BETA_CYBER_NETWORK_RPC_ENDPOINT
} from "./config.var";
import { IntlMessages } from "./ui/popup/language";

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
        ? "https://wallet.keplr.app/#/cosmoshub-3/stake"
        : "http://localhost:8081/#/cosmoshub-3/stake",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/cosmoshub-3/stake"
        : "http://localhost:8081/#/cosmoshub-3/stake",
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
        ? "https://wallet.keplr.app/#/kava-3/stake"
        : "http://localhost:8081/#/kava-3/stake",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/kava-3/stake"
        : "http://localhost:8081/#/kava-3/stake",
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
        ? "https://wallet.keplr.app/#/secret-1/stake"
        : "http://localhost:8081/#/secret-1/stake",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/secret-1/stake"
        : "http://localhost:8081/#/secret-1/stake",
    bip44: new BIP44(44, 118, 0),
    bech32Config: defaultBech32Config("secret"),
    currencies: ["secret"],
    feeCurrencies: ["secret"],
    coinType: 529
  },
  {
    rpc: BETA_CYBER_NETWORK_RPC_ENDPOINT,
    rest: BETA_CYBER_NETWORK_REST_ENDPOINT,
    chainId: "euler-6",
    chainName: "Cyber",
    nativeCurrency: "cyber",
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/euler-6/stake"
        : "http://localhost:8081/#/euler-6/stake",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/euler-6/stake"
        : "http://localhost:8081/#/euler-6/stake",
    bip44: new BIP44(44, 118, 0),
    bech32Config: defaultBech32Config("cyber"),
    currencies: ["cyber"],
    feeCurrencies: ["cyber"],
    beta: true
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
  },
  {
    chainId: "euler-6",
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
  },
  cyber: {
    coinDenom: "EUL",
    coinMinimalDenom: "eul",
    coinDecimals: 0
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

export const AdditionalSignInPrepend:
  | React.ReactElement
  | undefined = ADDITIONAL_SIGN_IN_PREPEND;

export const AdditonalIntlMessages: IntlMessages = ADDITIONAL_INTL_MESSAGES;
