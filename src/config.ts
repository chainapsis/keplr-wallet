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
    rpc: "http://goz.chainapsis.com:80",
    // Will not work.
    rest: "http://goz.chainapsis.com:80/rest",
    chainId: "chainapsis-3",
    chainName: "ChainApsis",
    nativeCurrency: "apsis",
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/cosmoshub-3"
        : "http://localhost:8081/#/cosmoshub-3",
    bip44: new BIP44(44, 118, 0),
    bech32Config: defaultBech32Config("cosmos"),
    currencies: ["apsis"],
    feeCurrencies: ["apsis"],
    faucetUrl: "http://goz.chainapsis.com:8000"
  },
  {
    rpc: "http://175.113.78.40:26657",
    // Will not work.
    rest: "http://175.113.78.40:26657/rest",
    chainId: "B-Harvest-3",
    chainName: "B-Harvest",
    nativeCurrency: "bhcoin",
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/cosmoshub-3"
        : "http://localhost:8081/#/cosmoshub-3",
    bip44: new BIP44(44, 118, 0),
    bech32Config: defaultBech32Config("cosmos"),
    currencies: ["bhcoin"],
    feeCurrencies: ["bhcoin"],
    faucetUrl: "http://34.70.0.224:8000"
  },
  {
    rpc: "http://121.78.184.125:26657",
    // Will not work.
    rest: "http://121.78.184.125:26657/rest",
    chainId: "achain-3",
    chainName: "Achain",
    nativeCurrency: "acoin",
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/cosmoshub-3"
        : "http://localhost:8081/#/cosmoshub-3",
    bip44: new BIP44(44, 118, 0),
    bech32Config: defaultBech32Config("cosmos"),
    currencies: ["acoin"],
    feeCurrencies: ["acoin"],
    faucetUrl: "http://121.78.184.125:8000"
  },
  {
    rpc: "http://ibc.blockscape.network:26657",
    // Will not work.
    rest: "http://ibc.blockscape.network:26657/rest",
    chainId: "NoChainNoGain-1000-3",
    chainName: "Blockscape",
    nativeCurrency: "gain",
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/cosmoshub-3"
        : "http://localhost:8081/#/cosmoshub-3",
    bip44: new BIP44(44, 118, 0),
    bech32Config: defaultBech32Config("cosmos"),
    currencies: ["gain"],
    feeCurrencies: ["gain"],
    faucetUrl: "http://ibc.blockscape.network:8000"
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
  apsis: {
    coinDenom: "APSIS",
    coinMinimalDenom: "uapsis",
    coinDecimals: 6
  },
  bhcoin: {
    coinDenom: "BHCOIN",
    coinMinimalDenom: "bhcoin",
    coinDecimals: 6
  },
  acoin: {
    coinDenom: "ACOIN",
    coinMinimalDenom: "acoin",
    coinDecimals: 6
  },
  gain: {
    coinDenom: "GAIN",
    coinMinimalDenom: "gain",
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
  ["chainapsis-3"]: {
    ["achain-3"]: {
      src: {
        channelId: "keplrchansrcac",
        portId: "transfer"
      },
      dst: {
        channelId: "keplrchandstac",
        portId: "transfer"
      }
    },
    ["B-Harvest-3"]: {
      src: {
        channelId: "keplrchansrcbh",
        portId: "transfer"
      },
      dst: {
        channelId: "keplrchandstbh",
        portId: "transfer"
      }
    },
    ["NoChainNoGain-1000-3"]: {
      src: {
        channelId: "keplrchansrcbs",
        portId: "transfer"
      },
      dst: {
        channelId: "keplrchandstbs",
        portId: "transfer"
      }
    }
  },
  ["achain-3"]: {
    ["chainapsis-3"]: {
      src: {
        channelId: "keplrchandstac",
        portId: "transfer"
      },
      dst: {
        channelId: "keplrchansrcac",
        portId: "transfer"
      }
    }
  },
  ["B-Harvest-3"]: {
    ["chainapsis-3"]: {
      src: {
        channelId: "keplrchandstbh",
        portId: "transfer"
      },
      dst: {
        channelId: "keplrchansrcbh",
        portId: "transfer"
      }
    }
  },
  ["NoChainNoGain-1000-3"]: {
    ["chainapsis-3"]: {
      src: {
        channelId: "keplrchandstbs",
        portId: "transfer"
      },
      dst: {
        channelId: "keplrchansrcbs",
        portId: "transfer"
      }
    }
  }
};
