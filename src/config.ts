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
    chainId: "chainapsis-1a",
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
    rpc: "http://34.83.0.237:26657",
    // Will not work.
    rest: "http://34.83.0.237:26657/rest",
    chainId: "gameofzoneshub-1a",
    chainName: "GoZ Hub",
    nativeCurrency: "doubloons",
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/cosmoshub-3"
        : "http://localhost:8081/#/cosmoshub-3",
    bip44: new BIP44(44, 118, 0),
    bech32Config: defaultBech32Config("cosmos"),
    currencies: ["doubloons"],
    feeCurrencies: ["doubloons"]
  },
  {
    rpc: "http://goz.desmos.network:80",
    // will not work.
    rest: "http://goz.desmos.network:80/rest",
    chainId: "morpheus-goz-1a",
    chainName: "Morpheus",
    nativeCurrency: "daric",
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/cosmoshub-3"
        : "http://localhost:8081/#/cosmoshub-3",
    bip44: new BIP44(44, 118, 0),
    bech32Config: defaultBech32Config("desmos"),
    currencies: ["daric"],
    feeCurrencies: ["daric"]
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
  doubloons: {
    coinDenom: "DBL",
    coinMinimalDenom: "doubloons",
    coinDecimals: 6
  },
  daric: {
    coinDenom: "DARIC",
    coinMinimalDenom: "udaric",
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
  ["chainapsis-1a"]: {
    ["gameofzoneshub-1a"]: {
      src: {
        channelId: "keplrgozsrc",
        portId: "transfer"
      },
      dst: {
        channelId: "keplrgozdst",
        portId: "transfer"
      }
    },
    ["morpheus-goz-1a"]: {
      src: {
        channelId: "fiocxrsnjz",
        portId: "transfer"
      },
      dst: {
        channelId: "sgxgjsihiq",
        portId: "transfer"
      }
    }
  },
  ["morpheus-goz-1a"]: {
    ["chainapsis-1a"]: {
      src: {
        channelId: "sgxgjsihiq",
        portId: "transfer"
      },
      dst: {
        channelId: "fiocxrsnjz",
        portId: "transfer"
      }
    }
  },
  ["gameofzoneshub-1a"]: {
    ["chainapsis-1a"]: {
      src: {
        channelId: "keplrgozdst",
        portId: "transfer"
      },
      dst: {
        channelId: "keplrgozsrc",
        portId: "transfer"
      }
    }
  }
};
