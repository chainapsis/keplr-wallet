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
    chainId: "chainapsis-2",
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
    rpc: "http://ibc.bharvest.io:26657",
    // Will not work.
    rest: "http://ibc.bharvest.io:26657/rest",
    chainId: "B-Harvest-2",
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
    faucetUrl: "http://34.64.105.250:8000"
  },
  {
    rpc: "http://95.217.180.90:26657",
    // Will not work.
    rest: "http://95.217.180.90:26657/rest",
    chainId: "p2p-org-2",
    chainName: "P2P",
    nativeCurrency: "ptp",
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/cosmoshub-3"
        : "http://localhost:8081/#/cosmoshub-3",
    bip44: new BIP44(44, 118, 0),
    bech32Config: defaultBech32Config("cosmos"),
    currencies: ["ptp"],
    feeCurrencies: ["ptp"],
    faucetUrl: "http://95.217.180.90:8000"
  },
  {
    rpc: "http://goz.desmos.network:80",
    // Will not work.
    rest: "http://goz.desmos.network:80/rest",
    chainId: "morpheus-goz-2",
    chainName: "Morpheus",
    nativeCurrency: "daric",
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/cosmoshub-3"
        : "http://localhost:8081/#/cosmoshub-3",
    bip44: new BIP44(44, 118, 0),
    bech32Config: defaultBech32Config("cosmos"),
    currencies: ["daric"],
    feeCurrencies: ["daric"],
    faucetUrl: "http://34.64.105.250:8001"
  },
  {
    rpc: "http://goz.val.network:26657",
    // Will not work.
    rest: "http://goz.val.network:26657/rest",
    chainId: "Compass-2",
    chainName: "Compass",
    nativeCurrency: "compass",
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/cosmoshub-3"
        : "http://localhost:8081/#/cosmoshub-3",
    bip44: new BIP44(44, 118, 0),
    bech32Config: defaultBech32Config("cosmos"),
    currencies: ["compass"],
    feeCurrencies: ["compass"],
    faucetUrl: "http://goz.val.network:8000"
  },
  {
    rpc: "http://3.112.29.150:26657",
    // Will not work.
    rest: "http://3.112.29.150:26657/rest",
    chainId: "okchain-2",
    chainName: "OKchain",
    nativeCurrency: "okt",
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/cosmoshub-3"
        : "http://localhost:8081/#/cosmoshub-3",
    bip44: new BIP44(44, 118, 0),
    bech32Config: defaultBech32Config("cosmos"),
    currencies: ["okt"],
    feeCurrencies: ["okt"],
    faucetUrl: "http://3.112.29.150:8000"
  },
  {
    rpc: "http://tamagotchi.cosmos.fish:26657",
    // Will not work.
    rest: "http://tamagotchi.cosmos.fish:26657/rest",
    chainId: "tamagotchi",
    chainName: "Tamagotchi",
    nativeCurrency: "tamago",
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/cosmoshub-3"
        : "http://localhost:8081/#/cosmoshub-3",
    bip44: new BIP44(44, 118, 0),
    bech32Config: defaultBech32Config("cosmos"),
    currencies: ["tamago"],
    feeCurrencies: ["tamago"],
    faucetUrl: "http://tamagotchi.cosmos.fish:8001"
  },
  {
    rpc: "http://tamagotchi.cosmos.fish:46657",
    // Will not work.
    rest: "http://tamagotchi.cosmos.fish:46657/rest",
    chainId: "tamagotchi-resources",
    chainName: "Tamagotchi Resources",
    nativeCurrency: "gas",
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/cosmoshub-3"
        : "http://localhost:8081/#/cosmoshub-3",
    bip44: new BIP44(44, 118, 0),
    bech32Config: defaultBech32Config("cosmos"),
    currencies: ["play", "feed", "clean"],
    feeCurrencies: ["gas"],
    faucetUrl: "http://tamagotchi.cosmos.fish:8000"
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
  daric: {
    coinDenom: "DARIC",
    coinMinimalDenom: "udaric",
    coinDecimals: 6
  },
  compass: {
    coinDenom: "COMPASS",
    coinMinimalDenom: "compass",
    coinDecimals: 6
  },
  ptp: {
    coinDenom: "PTP",
    coinMinimalDenom: "ptp",
    coinDecimals: 6
  },
  okt: {
    coinDenom: "OKT",
    coinMinimalDenom: "okt",
    coinDecimals: 6
  },
  gas: {
    coinDenom: "GAS",
    coinMinimalDenom: "gas",
    coinDecimals: 0
  },
  tamago: {
    coinDenom: "TAMAGO",
    coinMinimalDenom: "tamago",
    coinDecimals: 0
  },
  play: {
    coinDenom: "PLAY",
    coinMinimalDenom: "play",
    coinDecimals: 0
  },
  feed: {
    coinDenom: "FEED",
    coinMinimalDenom: "feed",
    coinDecimals: 0
  },
  clean: {
    coinDenom: "CLEAN",
    coinMinimalDenom: "clean",
    coinDecimals: 0
  },
  stake: {
    coinDenom: "STAKE",
    coinMinimalDenom: "stake",
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
  ["chainapsis-2"]: {
    ["B-Harvest-2"]: {
      src: {
        channelId: "keplrchanbhdst",
        portId: "transfer"
      },
      dst: {
        channelId: "keplrchanbhsrc",
        portId: "transfer"
      }
    },
    ["p2p-org-2"]: {
      src: {
        channelId: "keplrchanptpdst",
        portId: "transfer"
      },
      dst: {
        channelId: "keplrchanptpsrc",
        portId: "transfer"
      }
    },
    ["morpheus-goz-2"]: {
      src: {
        channelId: "keplrchanmordst",
        portId: "transfer"
      },
      dst: {
        channelId: "keplrchanmorsrc",
        portId: "transfer"
      }
    },
    ["Compass-2"]: {
      src: {
        channelId: "keplrchancomdst",
        portId: "transfer"
      },
      dst: {
        channelId: "keplrchancomsrc",
        portId: "transfer"
      }
    },
    ["okchain-2"]: {
      src: {
        channelId: "keplrchanokdst",
        portId: "transfer"
      },
      dst: {
        channelId: "keplrchanoksrc",
        portId: "transfer"
      }
    }
  },
  ["B-Harvest-2"]: {
    ["chainapsis-2"]: {
      src: {
        channelId: "keplrchanbhsrc",
        portId: "transfer"
      },
      dst: {
        channelId: "keplrchanbhdst",
        portId: "transfer"
      }
    }
  },
  ["p2p-org-2"]: {
    ["chainapsis-2"]: {
      src: {
        channelId: "keplrchanptpsrc",
        portId: "transfer"
      },
      dst: {
        channelId: "keplrchanptpdst",
        portId: "transfer"
      }
    }
  },
  ["morpheus-goz-2"]: {
    ["chainapsis-2"]: {
      src: {
        channelId: "keplrchanmorsrc",
        portId: "transfer"
      },
      dst: {
        channelId: "keplrchanmordst",
        portId: "transfer"
      }
    }
  },
  ["Compass-2"]: {
    ["chainapsis-2"]: {
      src: {
        channelId: "keplrchancomsrc",
        portId: "transfer"
      },
      dst: {
        channelId: "keplrchancomdst",
        portId: "transfer"
      }
    }
  },
  ["okchain-2"]: {
    ["chainapsis-2"]: {
      src: {
        channelId: "keplrchanoksrc",
        portId: "transfer"
      },
      dst: {
        channelId: "keplrchanokdst",
        portId: "transfer"
      }
    }
  },
  ["tamagotchi-resources"]: {
    ["tamagotchi"]: {
      src: {
        channelId: "icmvwvsmee",
        portId: "transfer"
      },
      dst: {
        channelId: "wzgulzlnll",
        portId: "transfer"
      }
    }
  },
  ["tamagotchi"]: {
    ["tamagotchi-resources"]: {
      src: {
        channelId: "wzgulzlnll",
        portId: "transfer"
      },
      dst: {
        channelId: "icmvwvsmee",
        portId: "transfer"
      }
    }
  }
};
