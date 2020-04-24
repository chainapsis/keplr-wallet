import { Currency, FiatCurrency } from "./common/currency";
import { BIP44 } from "@everett-protocol/cosmosjs/core/bip44";
import { defaultBech32Config } from "@everett-protocol/cosmosjs/core/bech32Config";
import { ChainInfo, AccessOrigin } from "./background/chains";

import { ETHEREUM_ENDPOINT } from "./config.var";

export const CoinGeckoAPIEndPoint = "https://api.coingecko.com/api/v3";
export const CoinGeckoGetPrice = "/simple/price";
export const AutoFetchingFiatValueInterval = 300 * 1000; // 5min

export const AutoFetchingAssetsInterval = 15 * 1000; // 15sec

// Endpoint for Ethereum node.
// This is used for ENS.
export const EthereumEndpoint = ETHEREUM_ENDPOINT;

export const EmbedChainInfos: ChainInfo[] = [
  {
    rpc: "http://127.0.0.1:26657",
    rest: "http://127.0.0.1:1337",
    chainId: "ibc0",
    chainName: "IBC Hub",
    nativeCurrency: "stake",
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
    currencies: ["stake"],
    feeCurrencies: ["stake"]
  },
  {
    rpc: "http://127.0.0.1:26557",
    rest: "http://127.0.0.1:2337",
    chainId: "ibc1",
    chainName: "IBC Zone",
    nativeCurrency: "stake",
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/kava-2"
        : "http://localhost:8081/#/kava-2",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/kava-2"
        : "http://localhost:8081/#/kava-2",
    bip44: new BIP44(44, 118, 0),
    bech32Config: defaultBech32Config("cosmos"),
    currencies: ["stake"],
    feeCurrencies: ["stake"]
  }
];

/**
 * This declares which origins can access extension without explicit approval.
 */
export const EmbedAccessOrigins: AccessOrigin[] = [
  {
    chainId: "ibc0",
    origins:
      process.env.NODE_ENV === "production" ? ["https://wallet.keplr.app"] : []
  },
  {
    chainId: "ibc1",
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
  stake: {
    coinDenom: "STAKE",
    coinMinimalDenom: "stake",
    coinDecimals: 6
  },
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

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface IBCPathInfo {
  [chainId: string]: {
    [chainId: string]: {
      src: {
        channelId: string;
        portId: string;
      };
      dst: {
        channelId: string;
        portId: string;
      };
    };
  };
}

export const EmbedIBCPathInfo: IBCPathInfo = {
  ["ibc0"]: {
    ["ibc1"]: {
      src: {
        channelId: "ibconexfer",
        portId: "transfer"
      },
      dst: {
        channelId: "ibczeroxfer",
        portId: "transfer"
      }
    }
  }
};
