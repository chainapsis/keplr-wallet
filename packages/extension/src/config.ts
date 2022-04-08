import { Bech32Address } from "@keplr-wallet/cosmos";
import { ChainInfo } from "@keplr-wallet/types";

import { PRIVILEGED_ORIGINS } from "./config.var";

export const EmbedChainInfos: ChainInfo[] = [
  {
    rpc: "https://rpc-fetchhub.fetch-ai.com",
    rest: "https://rest-fetchhub.fetch-ai.com",
    chainId: "fetchhub-4",
    chainName: "FetchHub",
    stakeCurrency: {
      coinDenom: "FET",
      coinMinimalDenom: "afet",
      coinDecimals: 18,
      coinGeckoId: "fetch-ai",
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("fetch"),
    currencies: [
      {
        coinDenom: "FET",
        coinMinimalDenom: "afet",
        coinDecimals: 18,
        coinGeckoId: "fetch-ai",
      },
      {
        coinDenom: "MOBX",
        coinMinimalDenom: "nanomobx",
        coinDecimals: 9,
      },
      {
        coinDenom: "NOMX",
        coinMinimalDenom: "nanonomx",
        coinDecimals: 9,
      },
      {
        coinDenom: "LRN",
        coinMinimalDenom: "ulrn",
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "FET",
        coinMinimalDenom: "afet",
        coinDecimals: 18,
        coinGeckoId: "fetch-ai",
      },
    ],
    coinType: 118,
    features: [],
    gasPriceStep: {
      low: 0,
      average: 5000000000,
      high: 6250000000,
    },
    walletUrlForStaking: "https://browse-fetchhub.fetch.ai/validators",
  },
  {
    rpc: "https://rpc-dorado.fetch.ai",
    rest: "https://rest-dorado.fetch.ai",
    chainId: "dorado-1",
    chainName: "Dorado",
    stakeCurrency: {
      coinDenom: "TESTFET",
      coinMinimalDenom: "atestfet",
      coinDecimals: 18,
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("fetch"),
    currencies: [
      {
        coinDenom: "TESTFET",
        coinMinimalDenom: "atestfet",
        coinDecimals: 18,
      },
      {
        coinDenom: "MOBX",
        coinMinimalDenom: "nanomobx",
        coinDecimals: 9,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "TESTFET",
        coinMinimalDenom: "atestfet",
        coinDecimals: 18,
      },
    ],
    coinType: 118,
    features: [],
    gasPriceStep: {
      low: 0,
      average: 5000000000,
      high: 6250000000,
    },
    walletUrlForStaking: "https://browse-dorado.fetch.ai/validators",
  },
];

// The origins that are able to pass any permission that external webpages can have.
export const PrivilegedOrigins: string[] = PRIVILEGED_ORIGINS;
