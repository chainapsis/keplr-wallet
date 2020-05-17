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
    rpc: "https://node-astrohub-1.keplr.app/rpc",
    rest: "https://node-astrohub-1.keplr.app/rest",
    chainId: "astrohub-1",
    chainName: "Astro Hub",
    nativeCurrency: "hub",
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/cosmoshub-3"
        : "http://localhost:8081/#/cosmoshub-3",
    bip44: new BIP44(44, 118, 0),
    bech32Config: defaultBech32Config("hub"),
    currencies: ["hub"],
    feeCurrencies: ["hub"],
    faucetUrl: "http://34.94.36.216:8000"
  },
  {
    rpc: "https://node-astrocanvas-1.keplr.app/rpc",
    rest: "https://node-astrocanvas-1.keplr.app/rest",
    chainId: "astrocanvas-1",
    chainName: "Astro Zone",
    nativeCurrency: "astro",
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/cosmoshub-3"
        : "http://localhost:8081/#/cosmoshub-3",
    bip44: new BIP44(44, 118, 0),
    bech32Config: defaultBech32Config("astro"),
    currencies: ["astro"],
    feeCurrencies: ["astro"],
    faucetUrl: "http://35.235.73.59:8000"
  }
];

/**
 * This declares which origins can access extension without explicit approval.
 */
export const EmbedAccessOrigins: AccessOrigin[] = [];

/**
 * Currencis include the currency information for matched coin.
 */
export const Currencies: {
  readonly [currency: string]: Currency;
} = {
  astro: {
    coinDenom: "ASTRO",
    coinMinimalDenom: "uastro",
    coinDecimals: 6
  },
  hub: {
    coinDenom: "HUB",
    coinMinimalDenom: "uhub",
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
  ["astrohub-1"]: {
    ["astrocanvas-1"]: {
      src: {
        channelId: "amqggnvske",
        portId: "transfer"
      },
      dst: {
        channelId: "cljcoxvqrm",
        portId: "transfer"
      }
    }
  },
  ["astrocanvas-1"]: {
    ["astrohub-1"]: {
      src: {
        channelId: "cljcoxvqrm",
        portId: "transfer"
      },
      dst: {
        channelId: "amqggnvske",
        portId: "transfer"
      }
    }
  }
};
