import { Bech32Address } from "@keplr-wallet/cosmos";
import { ChainInfo, ModularChainInfo } from "@keplr-wallet/types";

export const EmbedChainInfos: (ChainInfo | ModularChainInfo)[] = [
  {
    rpc: "https://rpc-cosmoshub.keplr.app",
    rest: "https://lcd-cosmoshub.keplr.app",
    chainId: "cosmoshub-4",
    chainName: "Cosmos Hub",
    stakeCurrency: {
      coinDenom: "ATOM",
      coinMinimalDenom: "uatom",
      coinDecimals: 6,
      coinGeckoId: "cosmos",
    },
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/cosmos-hub"
        : "http://localhost:8080/chains/cosmos-hub",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/cosmos-hub"
        : "http://localhost:8080/chains/cosmos-hub",
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("cosmos"),
    currencies: [
      {
        coinDenom: "ATOM",
        coinMinimalDenom: "uatom",
        coinDecimals: 6,
        coinGeckoId: "cosmos",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "ATOM",
        coinMinimalDenom: "uatom",
        coinDecimals: 6,
        coinGeckoId: "cosmos",
      },
    ],
    features: ["ibc-transfer", "ibc-go"],
  },
  {
    rpc: "https://rpc-osmosis.keplr.app",
    rest: "https://lcd-osmosis.keplr.app",
    chainId: "osmosis-1",
    chainName: "Osmosis",
    stakeCurrency: {
      coinDenom: "OSMO",
      coinMinimalDenom: "uosmo",
      coinDecimals: 6,
      coinGeckoId: "osmosis",
    },
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://app.osmosis.zone"
        : "https://app.osmosis.zone",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/osmosis"
        : "http://localhost:8080/chains/osmosis",
    bip44: { coinType: 118 },
    bech32Config: Bech32Address.defaultBech32Config("osmo"),
    currencies: [
      {
        coinDenom: "OSMO",
        coinMinimalDenom: "uosmo",
        coinDecimals: 6,
        coinGeckoId: "osmosis",
      },
      {
        coinDenom: "ION",
        coinMinimalDenom: "uion",
        coinDecimals: 6,
        coinGeckoId: "ion",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "OSMO",
        coinMinimalDenom: "uosmo",
        coinDecimals: 6,
        coinGeckoId: "osmosis",
        gasPriceStep: {
          low: 0,
          average: 0.025,
          high: 0.04,
        },
      },
    ],
    features: [
      "ibc-transfer",
      "ibc-go",
      "cosmwasm",
      "wasmd_0.24+",
      "osmosis-txfees",
    ],
  },
  {
    rpc: "https://rpc-secret.keplr.app",
    rest: "https://lcd-secret.keplr.app",
    chainId: "secret-4",
    chainName: "Secret Network",
    stakeCurrency: {
      coinDenom: "SCRT",
      coinMinimalDenom: "uscrt",
      coinDecimals: 6,
      coinGeckoId: "secret",
    },
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/secret-network"
        : "http://localhost:8080/chains/secret-network",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/secret-network"
        : "http://localhost:8080/chains/secret-network",
    bip44: {
      coinType: 529,
    },
    alternativeBIP44s: [
      {
        coinType: 118,
      },
    ],
    bech32Config: Bech32Address.defaultBech32Config("secret"),
    currencies: [
      {
        coinDenom: "SCRT",
        coinMinimalDenom: "uscrt",
        coinDecimals: 6,
        coinGeckoId: "secret",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "SCRT",
        coinMinimalDenom: "uscrt",
        coinDecimals: 6,
        coinGeckoId: "secret",
        gasPriceStep: {
          low: 0.2,
          average: 0.25,
          high: 0.3,
        },
      },
    ],
    features: ["secretwasm", "ibc-go", "ibc-transfer"],
  },
  {
    rpc: "https://rpc-akash.keplr.app",
    rest: "https://lcd-akash.keplr.app",
    chainId: "akashnet-2",
    chainName: "Akash",
    stakeCurrency: {
      coinDenom: "AKT",
      coinMinimalDenom: "uakt",
      coinDecimals: 6,
      coinGeckoId: "akash-network",
    },
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/akash"
        : "http://localhost:8080/chains/akash",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/akash"
        : "http://localhost:8080/chains/akash",
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("akash"),
    currencies: [
      {
        coinDenom: "AKT",
        coinMinimalDenom: "uakt",
        coinDecimals: 6,
        coinGeckoId: "akash-network",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "AKT",
        coinMinimalDenom: "uakt",
        coinDecimals: 6,
        coinGeckoId: "akash-network",
      },
    ],
    features: ["ibc-transfer"],
  },
  {
    rpc: "https://rpc-crypto-org.keplr.app",
    rest: "https://lcd-crypto-org.keplr.app",
    chainId: "crypto-org-chain-mainnet-1",
    chainName: "Crypto.org",
    stakeCurrency: {
      coinDenom: "CRO",
      coinMinimalDenom: "basecro",
      coinDecimals: 8,
      coinGeckoId: "crypto-com-chain",
    },
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/crypto-org"
        : "http://localhost:8080/chains/crypto-org",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/crypto-org"
        : "http://localhost:8080/chains/crypto-org",
    bip44: {
      coinType: 394,
    },
    bech32Config: {
      bech32PrefixAccAddr: "cro",
      bech32PrefixAccPub: "cropub",
      bech32PrefixValAddr: "crocncl",
      bech32PrefixValPub: "crocnclpub",
      bech32PrefixConsAddr: "crocnclcons",
      bech32PrefixConsPub: "crocnclconspub",
    },
    currencies: [
      {
        coinDenom: "CRO",
        coinMinimalDenom: "basecro",
        coinDecimals: 8,
        coinGeckoId: "crypto-com-chain",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "CRO",
        coinMinimalDenom: "basecro",
        coinDecimals: 8,
        coinGeckoId: "crypto-com-chain",
        gasPriceStep: {
          low: 0.025,
          average: 0.03,
          high: 0.04,
        },
      },
    ],
    features: ["ibc-transfer"],
  },
  {
    rpc: "https://rpc-iris.keplr.app",
    rest: "https://lcd-iris.keplr.app",
    chainId: "irishub-1",
    chainName: "IRISnet",
    stakeCurrency: {
      coinDenom: "IRIS",
      coinMinimalDenom: "uiris",
      coinDecimals: 6,
      coinGeckoId: "iris-network",
    },
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/irisnet"
        : "http://localhost:8080/chains/irisnet",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/irisnet"
        : "http://localhost:8080/chains/irisnet",
    bip44: {
      coinType: 118,
    },
    alternativeBIP44s: [
      {
        coinType: 566,
      },
    ],
    bech32Config: {
      bech32PrefixAccAddr: "iaa",
      bech32PrefixAccPub: "iap",
      bech32PrefixValAddr: "iva",
      bech32PrefixValPub: "ivp",
      bech32PrefixConsAddr: "ica",
      bech32PrefixConsPub: "icp",
    },
    currencies: [
      {
        coinDenom: "IRIS",
        coinMinimalDenom: "uiris",
        coinDecimals: 6,
        coinGeckoId: "iris-network",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "IRIS",
        coinMinimalDenom: "uiris",
        coinDecimals: 6,
        coinGeckoId: "iris-network",
        gasPriceStep: {
          low: 0.2,
          average: 0.3,
          high: 0.4,
        },
      },
    ],
    features: ["ibc-transfer", "ibc-go"],
  },
  {
    rpc: "https://rpc-regen.keplr.app",
    rest: "https://lcd-regen.keplr.app",
    chainId: "regen-1",
    chainName: "Regen",
    stakeCurrency: {
      coinDenom: "REGEN",
      coinMinimalDenom: "uregen",
      coinDecimals: 6,
      coinGeckoId: "regen",
    },
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/regen"
        : "http://localhost:8080/chains/regen",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/regen"
        : "http://localhost:8080/chains/regen",
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("regen"),
    currencies: [
      {
        coinDenom: "REGEN",
        coinMinimalDenom: "uregen",
        coinDecimals: 6,
        coinGeckoId: "regen",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "REGEN",
        coinMinimalDenom: "uregen",
        coinDecimals: 6,
        coinGeckoId: "regen",
        gasPriceStep: {
          low: 0.015,
          average: 0.025,
          high: 0.04,
        },
      },
    ],
    features: ["ibc-go", "ibc-transfer"],
  },
  {
    rpc: "https://rpc-persistence.keplr.app",
    rest: "https://lcd-persistence.keplr.app",
    chainId: "core-1",
    chainName: "Persistence",
    stakeCurrency: {
      coinDenom: "XPRT",
      coinMinimalDenom: "uxprt",
      coinDecimals: 6,
      coinGeckoId: "persistence",
    },
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/persistence"
        : "http://localhost:8080/chains/persistence",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/persistence"
        : "http://localhost:8080/chains/persistence",
    bip44: {
      coinType: 118,
    },
    alternativeBIP44s: [
      {
        coinType: 750,
      },
    ],
    bech32Config: Bech32Address.defaultBech32Config("persistence"),
    currencies: [
      {
        coinDenom: "XPRT",
        coinMinimalDenom: "uxprt",
        coinDecimals: 6,
        coinGeckoId: "persistence",
      },
      {
        coinDenom: "STKATOM",
        coinMinimalDenom: "stk/uatom",
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "XPRT",
        coinMinimalDenom: "uxprt",
        coinDecimals: 6,
        coinGeckoId: "persistence",
        gasPriceStep: {
          low: 0,
          average: 0.025,
          high: 0.04,
        },
      },
    ],
    features: ["ibc-transfer", "ibc-go"],
  },
  {
    rpc: "https://rpc-sentinel.keplr.app",
    rest: "https://lcd-sentinel.keplr.app",
    chainId: "sentinelhub-2",
    chainName: "Sentinel",
    stakeCurrency: {
      coinDenom: "DVPN",
      coinMinimalDenom: "udvpn",
      coinDecimals: 6,
      coinGeckoId: "sentinel",
    },
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/sentinel"
        : "http://localhost:8080/chains/sentinel",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/sentinel"
        : "http://localhost:8080/chains/sentinel",
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("sent"),
    currencies: [
      {
        coinDenom: "DVPN",
        coinMinimalDenom: "udvpn",
        coinDecimals: 6,
        coinGeckoId: "sentinel",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "DVPN",
        coinMinimalDenom: "udvpn",
        coinDecimals: 6,
        coinGeckoId: "sentinel",
        gasPriceStep: {
          low: 0.1,
          average: 0.25,
          high: 0.4,
        },
      },
    ],
    features: ["ibc-transfer"],
  },
  {
    rpc: "https://rpc-agoric.keplr.app",
    rest: "https://lcd-agoric.keplr.app",
    chainId: "agoric-3",
    chainName: "Agoric",
    stakeCurrency: {
      coinDenom: "BLD",
      coinMinimalDenom: "ubld",
      coinDecimals: 6,
      coinGeckoId: "agoric",
    },
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/agoric"
        : "http://localhost:8080/chains/agoric",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/agoric"
        : "http://localhost:8080/chains/agoric",
    bip44: {
      coinType: 564,
    },
    bech32Config: Bech32Address.defaultBech32Config("agoric"),
    currencies: [
      {
        coinDenom: "BLD",
        coinMinimalDenom: "ubld",
        coinDecimals: 6,
        coinGeckoId: "agoric",
      },
      {
        coinDenom: "IST",
        coinMinimalDenom: "uist",
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "BLD",
        coinMinimalDenom: "ubld",
        coinDecimals: 6,
        coinGeckoId: "agoric",
        gasPriceStep: {
          low: 0.012,
          average: 0.024,
          high: 0.071,
        },
      },
      {
        coinDenom: "IST",
        coinMinimalDenom: "uist",
        coinDecimals: 6,
        gasPriceStep: {
          low: 0.0034,
          average: 0.007,
          high: 0.02,
        },
      },
    ],
    features: ["ibc-go"],
  },
  {
    rpc: "https://rpc-cyber.keplr.app",
    rest: "https://lcd-cyber.keplr.app",
    chainId: "bostrom",
    chainName: "Bostrom",
    stakeCurrency: {
      coinDenom: "BOOT",
      coinMinimalDenom: "boot",
      coinDecimals: 0,
    },
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/bostrom"
        : "http://localhost:8080/chains/bostrom",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/bostrom"
        : "http://localhost:8080/chains/bostrom",
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("bostrom"),
    currencies: [
      {
        coinDenom: "BOOT",
        coinMinimalDenom: "boot",
        coinDecimals: 0,
      },
      {
        coinDenom: "H",
        coinMinimalDenom: "hydrogen",
        coinDecimals: 0,
      },
      {
        coinDenom: "V",
        coinMinimalDenom: "millivolt",
        coinDecimals: 3,
      },
      {
        coinDenom: "A",
        coinMinimalDenom: "milliampere",
        coinDecimals: 3,
      },
      {
        coinDenom: "TOCYB",
        coinMinimalDenom: "tocyb",
        coinDecimals: 0,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "BOOT",
        coinMinimalDenom: "boot",
        coinDecimals: 0,
        gasPriceStep: {
          low: 0,
          average: 0,
          high: 0.01,
        },
      },
    ],
    features: ["ibc-transfer", "cosmwasm", "ibc-go"],
  },
  {
    rpc: "https://rpc-juno.keplr.app",
    rest: "https://lcd-juno.keplr.app",
    chainId: "juno-1",
    chainName: "Juno",
    stakeCurrency: {
      coinDenom: "JUNO",
      coinMinimalDenom: "ujuno",
      coinDecimals: 6,
      coinGeckoId: "juno-network",
    },
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/juno"
        : "http://localhost:8080/chains/juno",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/juno"
        : "http://localhost:8080/chains/juno",
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("juno"),
    currencies: [
      {
        coinDenom: "JUNO",
        coinMinimalDenom: "ujuno",
        coinDecimals: 6,
        coinGeckoId: "juno-network",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "JUNO",
        coinMinimalDenom: "ujuno",
        coinDecimals: 6,
        coinGeckoId: "juno-network",
        gasPriceStep: {
          low: 0.001,
          average: 0.0025,
          high: 0.004,
        },
      },
      {
        coinDenom: "ATOM",
        coinMinimalDenom:
          "ibc/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9",
        coinDecimals: 6,
        gasPriceStep: {
          low: 0.001 * 0.33,
          average: 0.0025 * 0.33,
          high: 0.004 * 0.33,
        },
      },
    ],
    features: ["cosmwasm", "ibc-transfer", "ibc-go", "wasmd_0.24+"],
  },
  {
    rpc: "https://rpc-stargaze.keplr.app",
    rest: "https://lcd-stargaze.keplr.app",
    chainId: "stargaze-1",
    chainName: "Stargaze",
    stakeCurrency: {
      coinDenom: "STARS",
      coinMinimalDenom: "ustars",
      coinDecimals: 6,
      coinGeckoId: "stargaze",
    },
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/stargaze"
        : "http://localhost:8080/chains/stargaze",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/stargaze"
        : "http://localhost:8080/chains/stargaze",
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("stars"),
    currencies: [
      {
        coinDenom: "STARS",
        coinMinimalDenom: "ustars",
        coinDecimals: 6,
        coinGeckoId: "stargaze",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "STARS",
        coinMinimalDenom: "ustars",
        coinDecimals: 6,
        coinGeckoId: "stargaze",
      },
    ],
    features: ["ibc-transfer", "ibc-go"],
  },
  {
    rpc: "https://rpc-axelar.keplr.app",
    rest: "https://lcd-axelar.keplr.app",
    chainId: "axelar-dojo-1",
    chainName: "Axelar",
    stakeCurrency: {
      coinDenom: "AXL",
      coinMinimalDenom: "uaxl",
      coinDecimals: 6,
      coinGeckoId: "axelar",
    },
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/axelar"
        : "http://localhost:8080/chains/axelar",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/axelar"
        : "http://localhost:8080/chains/axelar",
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("axelar"),
    currencies: [
      {
        coinDenom: "AXL",
        coinMinimalDenom: "uaxl",
        coinDecimals: 6,
        coinGeckoId: "axelar",
      },
      {
        coinDenom: "WETH",
        coinMinimalDenom: "weth-wei",
        coinDecimals: 18,
        coinGeckoId: "weth",
      },
      {
        coinDenom: "USDC",
        coinMinimalDenom: "uusdc",
        coinDecimals: 6,
        coinGeckoId: "usd-coin",
      },
      {
        coinDenom: "FRAX",
        coinMinimalDenom: "frax-wei",
        coinDecimals: 18,
        coinGeckoId: "frax",
      },
      {
        coinDenom: "DAI",
        coinMinimalDenom: "dai-wei",
        coinDecimals: 18,
        coinGeckoId: "dai",
      },
      {
        coinDenom: "USDT",
        coinMinimalDenom: "uusdt",
        coinDecimals: 6,
        coinGeckoId: "tether",
      },
      {
        coinDenom: "WBTC",
        coinMinimalDenom: "wbtc-satoshi",
        coinDecimals: 8,
        coinGeckoId: "wrapped-bitcoin",
      },
      {
        coinDenom: "LINK",
        coinMinimalDenom: "link-wei",
        coinDecimals: 18,
        coinGeckoId: "chainlink",
      },
      {
        coinDenom: "AAVE",
        coinMinimalDenom: "aave-wei",
        coinDecimals: 18,
        coinGeckoId: "aave",
      },
      {
        coinDenom: "APE",
        coinMinimalDenom: "ape-wei",
        coinDecimals: 18,
        coinGeckoId: "apecoin",
      },
      {
        coinDenom: "AXS",
        coinMinimalDenom: "axs-wei",
        coinDecimals: 18,
        coinGeckoId: "axie-infinity",
      },
      {
        coinDenom: "MKR",
        coinMinimalDenom: "mkr-wei",
        coinDecimals: 18,
        coinGeckoId: "maker",
      },
      {
        coinDenom: "RAI",
        coinMinimalDenom: "rai-wei",
        coinDecimals: 18,
        coinGeckoId: "rai",
      },
      {
        coinDenom: "SHIB",
        coinMinimalDenom: "shib-wei",
        coinDecimals: 18,
        coinGeckoId: "shiba-inu",
      },
      {
        coinDenom: "stETH",
        coinMinimalDenom: "steth-wei",
        coinDecimals: 18,
        coinGeckoId: "staked-ether",
      },
      {
        coinDenom: "UNI",
        coinMinimalDenom: "uni-wei",
        coinDecimals: 18,
        coinGeckoId: "uniswap",
      },
      {
        coinDenom: "XCN",
        coinMinimalDenom: "xcn-wei",
        coinDecimals: 18,
        coinGeckoId: "chain-2",
      },
      {
        coinDenom: "WGLMR",
        coinMinimalDenom: "wglmr-wei",
        coinDecimals: 18,
        coinGeckoId: "wrapped-moonbeam",
      },
      {
        coinDenom: "DOT",
        coinMinimalDenom: "dot-planck",
        coinDecimals: 10,
        coinGeckoId: "polkadot",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "AXL",
        coinMinimalDenom: "uaxl",
        coinDecimals: 6,
        coinGeckoId: "axelar",
        gasPriceStep: {
          low: 0.007,
          average: 0.007,
          high: 0.01,
        },
      },
    ],
    features: ["ibc-transfer", "ibc-go", "axelar-evm-bridge"],
  },
  {
    rpc: "https://rpc-sommelier.keplr.app",
    rest: "https://lcd-sommelier.keplr.app",
    chainId: "sommelier-3",
    chainName: "Sommelier",
    stakeCurrency: {
      coinDenom: "SOMM",
      coinMinimalDenom: "usomm",
      coinDecimals: 6,
      coinGeckoId: "sommelier",
    },
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/sommelier"
        : "http://localhost:8080/chains/sommelier",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/sommelier"
        : "http://localhost:8080/chains/sommelier",
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("somm"),
    currencies: [
      {
        coinDenom: "SOMM",
        coinMinimalDenom: "usomm",
        coinDecimals: 6,
        coinGeckoId: "sommelier",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "SOMM",
        coinMinimalDenom: "usomm",
        coinDecimals: 6,
        coinGeckoId: "sommelier",
      },
    ],
    features: ["ibc-transfer", "ibc-go"],
  },
  {
    rpc: "https://rpc-umee.keplr.app",
    rest: "https://lcd-umee.keplr.app",
    chainId: "umee-1",
    chainName: "Umee",
    stakeCurrency: {
      coinDenom: "UMEE",
      coinMinimalDenom: "uumee",
      coinDecimals: 6,
    },
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/umee"
        : "http://localhost:8080/chains/umee",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/umee"
        : "http://localhost:8080/chains/umee",
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("umee"),
    currencies: [
      {
        coinDenom: "UMEE",
        coinMinimalDenom: "uumee",
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "UMEE",
        coinMinimalDenom: "uumee",
        coinDecimals: 6,
        gasPriceStep: {
          low: 0.05,
          average: 0.06,
          high: 0.1,
        },
      },
    ],
    features: ["ibc-transfer", "ibc-go"],
  },
  {
    rpc: "https://rpc-stride.keplr.app",
    rest: "https://lcd-stride.keplr.app",
    chainId: "stride-1",
    chainName: "Stride",
    stakeCurrency: {
      coinDenom: "STRD",
      coinMinimalDenom: "ustrd",
      coinDecimals: 6,
      coinGeckoId: "stride",
    },
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/stride"
        : "http://localhost:8080/chains/stride",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/stride"
        : "http://localhost:8080/chains/stride",
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("stride"),
    currencies: [
      {
        coinDenom: "STRD",
        coinMinimalDenom: "ustrd",
        coinDecimals: 6,
        coinGeckoId: "stride",
      },
      {
        coinDenom: "stATOM",
        coinMinimalDenom: "stuatom",
        coinDecimals: 6,
      },
      {
        coinDenom: "stOSMO",
        coinMinimalDenom: "stuosmo",
        coinDecimals: 6,
      },
      {
        coinDenom: "stJUNO",
        coinMinimalDenom: "stujuno",
        coinDecimals: 6,
      },
      {
        coinDenom: "stSTARS",
        coinMinimalDenom: "stustars",
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "STRD",
        coinMinimalDenom: "ustrd",
        coinDecimals: 6,
        coinGeckoId: "stride",
        gasPriceStep: {
          low: 0,
          average: 0,
          high: 0.04,
        },
      },
    ],
    features: ["ibc-transfer", "ibc-go"],
  },
  {
    rpc: "https://rpc-evmos.keplr.app",
    rest: "https://lcd-evmos.keplr.app",
    evm: {
      chainId: 9001,
      rpc: "https://evm-evmos.keplr.app",
    },
    chainId: "evmos_9001-2",
    chainName: "Evmos",
    stakeCurrency: {
      coinDenom: "EVMOS",
      coinMinimalDenom: "aevmos",
      coinDecimals: 18,
      coinGeckoId: "evmos",
    },
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/evmos"
        : "http://localhost:8080/chains/evmos",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/evmos"
        : "http://localhost:8080/chains/evmos",
    bip44: {
      coinType: 60,
    },
    bech32Config: Bech32Address.defaultBech32Config("evmos"),
    currencies: [
      {
        coinDenom: "EVMOS",
        coinMinimalDenom: "aevmos",
        coinDecimals: 18,
        coinGeckoId: "evmos",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "EVMOS",
        coinMinimalDenom: "aevmos",
        coinDecimals: 18,
        coinGeckoId: "evmos",
        gasPriceStep: {
          low: 25000000000,
          average: 25000000000,
          high: 40000000000,
        },
      },
    ],
    features: ["ibc-transfer", "ibc-go", "eth-address-gen", "eth-key-sign"],
  },
  {
    rpc: "https://rpc-injective.keplr.app",
    rest: "https://lcd-injective.keplr.app",
    chainId: "injective-1",
    chainName: "Injective",
    stakeCurrency: {
      coinDenom: "INJ",
      coinMinimalDenom: "inj",
      coinDecimals: 18,
      coinGeckoId: "injective-protocol",
    },
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/injective"
        : "http://localhost:8080/chains/injective",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/injective"
        : "http://localhost:8080/chains/injective",
    bip44: {
      coinType: 60,
    },
    bech32Config: Bech32Address.defaultBech32Config("inj"),
    currencies: [
      {
        coinDenom: "INJ",
        coinMinimalDenom: "inj",
        coinDecimals: 18,
        coinGeckoId: "injective-protocol",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "INJ",
        coinMinimalDenom: "inj",
        coinDecimals: 18,
        coinGeckoId: "injective-protocol",
        gasPriceStep: {
          low: 5000000000,
          average: 25000000000,
          high: 50000000000,
        },
      },
    ],
    features: [
      "ibc-transfer",
      "ibc-go",
      "eth-address-gen",
      "eth-key-sign",
      "force-not-show-evm-address",
    ],
  },
  {
    rpc: "https://rpc-kava.keplr.app",
    rest: "https://lcd-kava.keplr.app",
    chainId: "kava_2222-10",
    chainName: "Kava",
    stakeCurrency: {
      coinDenom: "KAVA",
      coinMinimalDenom: "ukava",
      coinDecimals: 6,
      coinGeckoId: "kava",
    },
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/kava"
        : "http://localhost:8080/chains/kava",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/kava"
        : "http://localhost:8080/chains/kava",
    bip44: { coinType: 459 },
    alternativeBIP44s: [{ coinType: 118 }],
    bech32Config: Bech32Address.defaultBech32Config("kava"),
    currencies: [
      {
        coinDenom: "KAVA",
        coinMinimalDenom: "ukava",
        coinDecimals: 6,
        coinGeckoId: "kava",
      },
      {
        coinDenom: "SWP",
        coinMinimalDenom: "swp",
        coinDecimals: 6,
        coinGeckoId: "kava-swap",
      },
      {
        coinDenom: "USDX",
        coinMinimalDenom: "usdx",
        coinDecimals: 6,
        coinGeckoId: "usdx",
      },
      {
        coinDenom: "HARD",
        coinMinimalDenom: "hard",
        coinDecimals: 6,
      },
      {
        coinDenom: "BNB",
        coinMinimalDenom: "bnb",
        coinDecimals: 8,
      },
      {
        coinDenom: "BTCB",
        coinMinimalDenom: "btcb",
        coinDecimals: 8,
      },
      {
        coinDenom: "BUSD",
        coinMinimalDenom: "busd",
        coinDecimals: 8,
      },
      {
        coinDenom: "XRPB",
        coinMinimalDenom: "xrpb",
        coinDecimals: 8,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "KAVA",
        coinMinimalDenom: "ukava",
        coinDecimals: 6,
        coinGeckoId: "kava",
        gasPriceStep: {
          low: 0.05,
          average: 0.1,
          high: 0.25,
        },
      },
    ],
  },
  {
    rpc: "https://rpc-quicksilver.keplr.app",
    rest: "https://lcd-quicksilver.keplr.app",
    chainId: "quicksilver-1",
    chainName: "Quicksilver",
    stakeCurrency: {
      coinDenom: "QCK",
      coinMinimalDenom: "uqck",
      coinDecimals: 6,
    },
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/quicksilver"
        : "http://localhost:8080/chains/quicksilver",
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "quick",
      bech32PrefixAccPub: "quickpub",
      bech32PrefixValAddr: "quickvaloper",
      bech32PrefixValPub: "quickvaloperpub",
      bech32PrefixConsAddr: "quickvalcons",
      bech32PrefixConsPub: "quickvalconspub",
    },
    currencies: [
      {
        coinDenom: "QCK",
        coinMinimalDenom: "uqck",
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "QCK",
        coinMinimalDenom: "uqck",
        coinDecimals: 6,
        gasPriceStep: {
          low: 0,
          average: 0.0001,
          high: 0.00025,
        },
      },
    ],
    features: [],
  },
  {
    rpc: "https://rpc-phoenix.keplr.app",
    rest: "https://lcd-phoenix.keplr.app",
    chainId: "phoenix-1",
    chainName: "Terra",
    stakeCurrency: {
      coinDenom: "LUNA",
      coinMinimalDenom: "uluna",
      coinDecimals: 6,
      coinGeckoId: "terra-luna-2",
    },
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/terra"
        : "http://localhost:8080/chains/terra",
    bip44: {
      coinType: 330,
    },
    bech32Config: {
      bech32PrefixAccAddr: "terra",
      bech32PrefixAccPub: "terrapub",
      bech32PrefixValAddr: "terravaloper",
      bech32PrefixValPub: "terravaloperpub",
      bech32PrefixConsAddr: "terravalcons",
      bech32PrefixConsPub: "terravalconspub",
    },
    currencies: [
      {
        coinDenom: "LUNA",
        coinMinimalDenom: "uluna",
        coinDecimals: 6,
        coinGeckoId: "terra-luna-2",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "LUNA",
        coinMinimalDenom: "uluna",
        coinDecimals: 6,
        coinGeckoId: "terra-luna-2",
        gasPriceStep: {
          low: 0.15,
          average: 0.25,
          high: 0.4,
        },
      },
    ],
    features: [],
  },
  {
    rpc: "https://rpc-columbus.keplr.app",
    rest: "https://lcd-columbus.keplr.app",
    chainId: "columbus-5",
    chainName: "Terra Classic",
    stakeCurrency: {
      coinDenom: "LUNC",
      coinMinimalDenom: "uluna",
      coinDecimals: 6,
      coinGeckoId: "terra-luna",
    },
    bip44: {
      coinType: 330,
    },
    bech32Config: {
      bech32PrefixAccAddr: "terra",
      bech32PrefixAccPub: "terrapub",
      bech32PrefixValAddr: "terravaloper",
      bech32PrefixValPub: "terravaloperpub",
      bech32PrefixConsAddr: "terravalcons",
      bech32PrefixConsPub: "terravalconspub",
    },
    currencies: [
      {
        coinDenom: "LUNC",
        coinMinimalDenom: "uluna",
        coinDecimals: 6,
        coinGeckoId: "terra-luna",
      },
      {
        coinDenom: "USTC",
        coinMinimalDenom: "uusd",
        coinDecimals: 6,
        coinGeckoId: "terrausd",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "LUNC",
        coinMinimalDenom: "uluna",
        coinDecimals: 6,
        coinGeckoId: "terra-luna",
        gasPriceStep: {
          low: 28.325,
          average: 28.325,
          high: 28.325,
        },
      },
      {
        coinDenom: "USTC",
        coinMinimalDenom: "uusd",
        coinDecimals: 6,
        coinGeckoId: "terrausd",
        gasPriceStep: {
          low: 0.75,
          average: 0.75,
          high: 0.75,
        },
      },
    ],
    features: ["terra-classic-fee"],
  },
  {
    rpc: "https://rpc-noble.keplr.app",
    rest: "https://lcd-noble.keplr.app",
    chainId: "noble-1",
    chainName: "Noble",
    stakeCurrency: {
      coinDenom: "STAKE",
      coinMinimalDenom: "ustake",
      coinDecimals: 6,
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "noble",
      bech32PrefixAccPub: "noblepub",
      bech32PrefixValAddr: "noblevaloper",
      bech32PrefixValPub: "noblevaloperpub",
      bech32PrefixConsAddr: "noblevalcons",
      bech32PrefixConsPub: "noblevalconspub",
    },
    currencies: [
      {
        coinDenom: "STAKE",
        coinMinimalDenom: "ustake",
        coinDecimals: 6,
      },
      {
        coinDenom: "USDC",
        coinMinimalDenom: "uusdc",
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "USDC",
        coinMinimalDenom: "uusdc",
        coinDecimals: 6,
      },
      {
        coinDenom: "ATOM",
        coinMinimalDenom:
          "ibc/EF48E6B1A1A19F47ECAEA62F5670C37C0580E86A9E88498B7E393EB6F49F33C0",
        coinDecimals: 6,
        gasPriceStep: {
          low: 0.001,
          average: 0.001,
          high: 0.001,
        },
      },
    ],
    features: [],
  },
  {
    rpc: "https://rpc-omniflixhub.keplr.app",
    rest: "https://lcd-omniflixhub.keplr.app",
    chainId: "omniflixhub-1",
    chainName: "OmniFlix",
    stakeCurrency: {
      coinDenom: "FLIX",
      coinMinimalDenom: "uflix",
      coinDecimals: 6,
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "omniflix",
      bech32PrefixAccPub: "omniflixpub",
      bech32PrefixValAddr: "omniflixvaloper",
      bech32PrefixValPub: "omniflixvaloperpub",
      bech32PrefixConsAddr: "omniflixvalcons",
      bech32PrefixConsPub: "omniflixvalconspub",
    },
    currencies: [
      {
        coinDenom: "FLIX",
        coinMinimalDenom: "uflix",
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "FLIX",
        coinMinimalDenom: "uflix",
        coinDecimals: 6,
        gasPriceStep: {
          low: 0.001,
          average: 0.0025,
          high: 0.025,
        },
      },
    ],
    features: [],
  },
  {
    rpc: "https://rpc-kyve.keplr.app",
    rest: "https://lcd-kyve.keplr.app",
    chainId: "kyve-1",
    chainName: "KYVE",
    stakeCurrency: {
      coinDenom: "KYVE",
      coinMinimalDenom: "ukyve",
      coinDecimals: 6,
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "kyve",
      bech32PrefixAccPub: "kyvepub",
      bech32PrefixValAddr: "kyvevaloper",
      bech32PrefixValPub: "kyvevaloperpub",
      bech32PrefixConsAddr: "kyvevalcons",
      bech32PrefixConsPub: "kyvevalconspub",
    },
    currencies: [
      {
        coinDenom: "KYVE",
        coinMinimalDenom: "ukyve",
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "KYVE",
        coinMinimalDenom: "ukyve",
        coinDecimals: 6,
        gasPriceStep: {
          low: 0.02,
          average: 0.03,
          high: 0.06,
        },
      },
    ],
    features: [],
  },
  {
    rpc: "https://rpc-neutron.keplr.app",
    rest: "https://lcd-neutron.keplr.app",
    chainId: "neutron-1",
    chainName: "Neutron",
    stakeCurrency: {
      coinDenom: "STAKE",
      coinMinimalDenom: "ustake",
      coinDecimals: 6,
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "neutron",
      bech32PrefixAccPub: "neutronpub",
      bech32PrefixValAddr: "neutronvaloper",
      bech32PrefixValPub: "neutronvaloperpub",
      bech32PrefixConsAddr: "neutronvalcons",
      bech32PrefixConsPub: "neutronvalconspub",
    },
    currencies: [
      {
        coinDenom: "NTRN",
        coinMinimalDenom: "untrn",
        coinDecimals: 6,
      },
      {
        coinDenom: "STAKE",
        coinMinimalDenom: "ustake",
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "NTRN",
        coinMinimalDenom: "untrn",
        coinDecimals: 6,
      },
    ],
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/neutron"
        : "http://localhost:8080/chains/neutron",
    features: [],
  },
  {
    rpc: "https://rpc-likecoin.keplr.app",
    rest: "https://lcd-likecoin.keplr.app",
    chainId: "likecoin-mainnet-2",
    chainName: "Likecoin",
    stakeCurrency: {
      coinDenom: "LIKE",
      coinMinimalDenom: "nanolike",
      coinDecimals: 9,
      coinGeckoId: "likecoin",
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "like",
      bech32PrefixAccPub: "likepub",
      bech32PrefixValAddr: "likevaloper",
      bech32PrefixValPub: "likevaloperpub",
      bech32PrefixConsAddr: "likevalcons",
      bech32PrefixConsPub: "likevalconspub",
    },
    currencies: [
      {
        coinDenom: "LIKE",
        coinMinimalDenom: "nanolike",
        coinDecimals: 9,
        coinGeckoId: "likecoin",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "LIKE",
        coinMinimalDenom: "nanolike",
        coinDecimals: 9,
        coinGeckoId: "likecoin",
        gasPriceStep: {
          low: 1,
          average: 2,
          high: 3,
        },
      },
    ],
    features: [],
  },
  {
    rpc: "https://rpc-dydx.keplr.app",
    rest: "https://lcd-dydx.keplr.app",
    chainId: "dydx-mainnet-1",
    chainName: "dYdX",
    stakeCurrency: {
      coinDenom: "DYDX",
      coinDecimals: 18,
      coinMinimalDenom: "adydx",
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "dydx",
      bech32PrefixAccPub: "dydxpub",
      bech32PrefixValAddr: "dydxvaloper",
      bech32PrefixValPub: "dydxvaloperpub",
      bech32PrefixConsAddr: "dydxvalcons",
      bech32PrefixConsPub: "dydxvalconspub",
    },
    currencies: [
      {
        coinDenom: "DYDX",
        coinDecimals: 18,
        coinMinimalDenom: "adydx",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "DYDX",
        coinDecimals: 18,
        coinMinimalDenom: "adydx",
      },
    ],
    features: [],
  },
  {
    rpc: "https://rpc-celestia.keplr.app",
    rest: "https://lcd-celestia.keplr.app",
    chainId: "celestia",
    chainName: "Celestia",
    stakeCurrency: {
      coinDenom: "TIA",
      coinDecimals: 6,
      coinMinimalDenom: "utia",
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("celestia"),
    currencies: [
      {
        coinDenom: "TIA",
        coinDecimals: 6,
        coinMinimalDenom: "utia",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "TIA",
        coinDecimals: 6,
        coinMinimalDenom: "utia",
      },
    ],
    features: [],
  },
  {
    rpc: "https://rpc-passage.keplr.app",
    rest: "https://lcd-passage.keplr.app",
    chainId: "passage-2",
    chainName: "Passage",
    stakeCurrency: {
      coinDenom: "PASG",
      coinMinimalDenom: "upasg",
      coinDecimals: 6,
      coinGeckoId: "passage",
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("pasg"),
    currencies: [
      {
        coinDenom: "PASG",
        coinMinimalDenom: "upasg",
        coinDecimals: 6,
        coinGeckoId: "passage",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "PASG",
        coinMinimalDenom: "upasg",
        coinDecimals: 6,
        coinGeckoId: "passage",
      },
    ],
    features: ["cosmwasm"],
  },
  {
    chainId: "dymension_1100-1",
    chainName: "Dymension",
    rpc: "https://rpc-dymension.keplr.app",
    rest: "https://lcd-dymension.keplr.app",
    currencies: [
      {
        coinMinimalDenom: "adym",
        coinDenom: "DYM",
        coinDecimals: 18,
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/dymension_1100/chain.png",
      },
    ],
    bip44: {
      coinType: 60,
    },
    bech32Config: {
      bech32PrefixAccAddr: "dym",
      bech32PrefixAccPub: "dympub",
      bech32PrefixValAddr: "dymvaloper",
      bech32PrefixValPub: "dymvaloperpub",
      bech32PrefixConsAddr: "dymvalcons",
      bech32PrefixConsPub: "dymvalconspub",
    },
    stakeCurrency: {
      coinMinimalDenom: "adym",
      coinDenom: "DYM",
      coinDecimals: 18,
    },
    feeCurrencies: [
      {
        coinMinimalDenom: "adym",
        coinDenom: "DYM",
        coinDecimals: 18,
        gasPriceStep: {
          average: 20000000000,
          high: 20000000000,
          low: 20000000000,
        },
      },
    ],
    features: ["eth-address-gen", "eth-key-sign"],
  },
  {
    chainId: "chihuahua-1",
    chainName: "Chihuahua",
    rpc: "https://rpc-chihuahua.keplr.app",
    rest: "https://lcd-chihuahua.keplr.app",
    stakeCurrency: {
      coinDenom: "HUAHUA",
      coinMinimalDenom: "uhuahua",
      coinDecimals: 6,
      coinGeckoId: "chihuahua-token",
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "chihuahua",
      bech32PrefixAccPub: "chihuahuapub",
      bech32PrefixValAddr: "chihuahuavaloper",
      bech32PrefixValPub: "chihuahuavaloperpub",
      bech32PrefixConsAddr: "chihuahuavalcons",
      bech32PrefixConsPub: "chihuahuavalconspub",
    },
    currencies: [
      {
        coinDenom: "HUAHUA",
        coinMinimalDenom: "uhuahua",
        coinDecimals: 6,
        coinGeckoId: "chihuahua-token",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "HUAHUA",
        coinMinimalDenom: "uhuahua",
        coinDecimals: 6,
        coinGeckoId: "chihuahua-token",
        gasPriceStep: {
          low: 500,
          average: 1250,
          high: 2000,
        },
      },
    ],
    features: ["cosmwasm"],
  },
  {
    rpc: "https://tncnt-eu-wormchain-main-01.rpc.p2p.world",
    rest: "https://tncnt-eu-wormchain-main-01.rpc.p2p.world/lcd",
    chainId: "wormchain",
    chainName: "Wormhole",
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "wormhole",
      bech32PrefixAccPub: "wormholepub",
      bech32PrefixValAddr: "wormholevaloper",
      bech32PrefixValPub: "wormholevaloperpub",
      bech32PrefixConsAddr: "wormholevalcons",
      bech32PrefixConsPub: "wormholevalconspub",
    },
    currencies: [
      {
        coinDenom: "WETH",
        coinMinimalDenom:
          "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/5BWqpR48Lubd55szM5i62zK7TFkddckhbT48yy6mNbDp",
        coinDecimals: 8,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "TEST",
        coinMinimalDenom: "utest",
        coinDecimals: 6,
        gasPriceStep: {
          low: 1,
          average: 1,
          high: 1,
        },
      },
    ],
    features: ["cosmwasm"],
    hideInUI: true,
  },
  {
    chainId: "ssc-1",
    chainName: "Saga",
    rpc: "https://rpc-saga.keplr.app",
    rest: "https://lcd-saga.keplr.app",
    stakeCurrency: {
      coinDenom: "SAGA",
      coinMinimalDenom: "usaga",
      coinDecimals: 6,
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "saga",
      bech32PrefixAccPub: "sagapub",
      bech32PrefixValAddr: "sagavaloper",
      bech32PrefixValPub: "sagavaloperpub",
      bech32PrefixConsAddr: "sagavalcons",
      bech32PrefixConsPub: "sagavalconspub",
    },
    currencies: [
      {
        coinDenom: "SAGA",
        coinMinimalDenom: "usaga",
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "SAGA",
        coinMinimalDenom: "usaga",
        coinDecimals: 6,
      },
    ],
  },
  {
    chainId: "seda-1",
    chainName: "SEDA",
    rpc: "https://rpc-seda.keplr.app",
    rest: "https://lcd-seda.keplr.app",
    stakeCurrency: {
      coinDenom: "SEDA",
      coinMinimalDenom: "aseda",
      coinDecimals: 18,
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "seda",
      bech32PrefixAccPub: "sedapub",
      bech32PrefixValAddr: "sedavaloper",
      bech32PrefixValPub: "sedavaloperpub",
      bech32PrefixConsAddr: "sedavalcons",
      bech32PrefixConsPub: "sedavalconspub",
    },
    currencies: [
      {
        coinDenom: "SEDA",
        coinMinimalDenom: "aseda",
        coinDecimals: 18,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "SEDA",
        coinMinimalDenom: "aseda",
        coinDecimals: 18,
        gasPriceStep: {
          low: 25000000000,
          average: 25000000000,
          high: 40000000000,
        },
      },
    ],
    features: ["cosmwasm"],
  },
  {
    rpc: "https://rpc-dimension.keplr.app",
    rest: "https://lcd-dimension.keplr.app",
    chainId: "dimension_37-1",
    chainName: "XPLA",
    stakeCurrency: {
      coinDenom: "XPLA",
      coinMinimalDenom: "axpla",
      coinDecimals: 18,
      coinGeckoId: "xpla",
    },
    bip44: {
      coinType: 60,
    },
    bech32Config: {
      bech32PrefixAccAddr: "xpla",
      bech32PrefixAccPub: "xplapub",
      bech32PrefixValAddr: "xplavaloper",
      bech32PrefixValPub: "xplavaloperpub",
      bech32PrefixConsAddr: "xplavalcons",
      bech32PrefixConsPub: "xplavalconspub",
    },
    currencies: [
      {
        coinDenom: "XPLA",
        coinMinimalDenom: "axpla",
        coinDecimals: 18,
        coinGeckoId: "xpla",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "XPLA",
        coinMinimalDenom: "axpla",
        coinDecimals: 18,
        coinGeckoId: "xpla",
        gasPriceStep: {
          low: 850000000000,
          average: 1147500000000,
          high: 1487500000000,
        },
      },
    ],
    features: ["eth-address-gen", "eth-key-sign", "cosmwasm"],
  },
  {
    rpc: "https://rpc-pryzm.keplr.app",
    rest: "https://lcd-pryzm.keplr.app",
    chainId: "pryzm-1",
    chainName: "Pryzm",
    stakeCurrency: {
      coinDenom: "PRYZM",
      coinMinimalDenom: "upryzm",
      coinDecimals: 6,
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "pryzm",
      bech32PrefixAccPub: "pryzmpub",
      bech32PrefixValAddr: "pryzmvaloper",
      bech32PrefixValPub: "pryzmvaloperpub",
      bech32PrefixConsAddr: "pryzmvalcons",
      bech32PrefixConsPub: "pryzmvalconspub",
    },
    currencies: [
      {
        coinDenom: "PRYZM",
        coinMinimalDenom: "upryzm",
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "PRYZM",
        coinMinimalDenom: "upryzm",
        coinDecimals: 6,
      },
    ],
    features: ["cosmwasm"],
  },
  {
    rpc: "https://rpc-zetachain.keplr.app",
    rest: "https://lcd-zetachain.keplr.app",
    chainId: "zetachain_7000-1",
    chainName: "ZetaChain",
    stakeCurrency: {
      coinDenom: "ZETA",
      coinMinimalDenom: "azeta",
      coinDecimals: 18,
    },
    bip44: {
      coinType: 60,
    },
    bech32Config: {
      bech32PrefixAccAddr: "zeta",
      bech32PrefixAccPub: "zetapub",
      bech32PrefixValAddr: "zetavaloper",
      bech32PrefixValPub: "zetavaloperpub",
      bech32PrefixConsAddr: "ezetaalcons",
      bech32PrefixConsPub: "zetavalconspub",
    },
    currencies: [
      {
        coinDenom: "ZETA",
        coinMinimalDenom: "azeta",
        coinDecimals: 18,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "ZETA",
        coinMinimalDenom: "azeta",
        coinDecimals: 18,
        gasPriceStep: {
          low: 80000000000,
          average: 80000000000,
          high: 80000000000,
        },
      },
    ],
    features: ["eth-address-gen", "eth-key-sign"],
  },
  {
    rpc: "https://evm-1.keplr.app",
    rest: "https://evm-1.keplr.app",
    evm: {
      chainId: 1,
      rpc: "https://evm-1.keplr.app",
      websocket: "wss://evm-1.keplr.app/websocket",
    },
    chainId: "eip155:1",
    chainName: "Ethereum",
    chainSymbolImageUrl:
      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:1/chain.png",
    bip44: {
      coinType: 60,
    },
    currencies: [
      {
        coinDenom: "ETH",
        coinMinimalDenom: "ethereum-native",
        coinDecimals: 18,
        coinGeckoId: "ethereum",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:1/chain.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "ETH",
        coinMinimalDenom: "ethereum-native",
        coinDecimals: 18,
        coinGeckoId: "ethereum",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:1/chain.png",
      },
    ],
    features: [],
  },
  {
    rpc: "https://evm-8453.keplr.app",
    rest: "https://evm-8453.keplr.app",
    evm: {
      chainId: 8453,
      rpc: "https://evm-8453.keplr.app",
      websocket: "wss://evm-8453.keplr.app/websocket",
    },
    chainId: "eip155:8453",
    chainName: "Base",
    chainSymbolImageUrl:
      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:8453/chain.png",
    bip44: {
      coinType: 60,
    },
    currencies: [
      {
        coinDenom: "ETH",
        coinMinimalDenom: "base-native",
        coinDecimals: 18,
        coinGeckoId: "ethereum",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:1/chain.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "ETH",
        coinMinimalDenom: "base-native",
        coinDecimals: 18,
        coinGeckoId: "ethereum",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:1/chain.png",
      },
    ],
    features: ["op-stack-l1-data-fee"],
  },
  {
    rpc: "https://evm-10.keplr.app",
    rest: "https://evm-10.keplr.app",
    evm: {
      chainId: 10,
      rpc: "https://evm-10.keplr.app",
      websocket: "wss://evm-10.keplr.app/websocket",
    },
    chainId: "eip155:10",
    chainName: "Optimism",
    chainSymbolImageUrl:
      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:10/chain.png",
    bip44: {
      coinType: 60,
    },
    currencies: [
      {
        coinDenom: "ETH",
        coinMinimalDenom: "optimism-native",
        coinDecimals: 18,
        coinGeckoId: "ethereum",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:1/chain.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "ETH",
        coinMinimalDenom: "optimism-native",
        coinDecimals: 18,
        coinGeckoId: "ethereum",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:1/chain.png",
      },
    ],
    features: ["op-stack-l1-data-fee"],
  },
  {
    rpc: "https://evm-42161.keplr.app",
    rest: "https://evm-42161.keplr.app",
    evm: {
      chainId: 42161,
      rpc: "https://evm-42161.keplr.app",
      websocket: "wss://evm-42161.keplr.app/websocket",
    },
    chainId: "eip155:42161",
    chainName: "Arbitrum",
    chainSymbolImageUrl:
      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:42161/chain.png",
    bip44: {
      coinType: 60,
    },
    currencies: [
      {
        coinDenom: "ETH",
        coinMinimalDenom: "arbitrum-native",
        coinDecimals: 18,
        coinGeckoId: "ethereum",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:1/chain.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "ETH",
        coinMinimalDenom: "arbitrum-native",
        coinDecimals: 18,
        coinGeckoId: "ethereum",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:1/chain.png",
      },
    ],
    features: ["eth-address-gen", "eth-key-sign"],
  },
  {
    rpc: "https://evm-137.keplr.app",
    rest: "https://evm-137.keplr.app",
    evm: {
      chainId: 137,
      rpc: "https://evm-137.keplr.app",
      websocket: "wss://evm-137.keplr.app/websocket",
    },
    chainId: "eip155:137",
    chainName: "Polygon",
    chainSymbolImageUrl:
      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:137/chain.png",
    bip44: {
      coinType: 60,
    },
    currencies: [
      {
        coinDenom: "MATIC",
        coinMinimalDenom: "polygon-native",
        coinDecimals: 18,
        coinGeckoId: "matic-network",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:137/chain.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "MATIC",
        coinMinimalDenom: "polygon-native",
        coinDecimals: 18,
        coinGeckoId: "matic-network",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:137/chain.png",
      },
    ],
    features: [],
  },
  {
    rpc: "https://evm-56.keplr.app",
    rest: "https://evm-56.keplr.app",
    evm: {
      chainId: 56,
      rpc: "https://evm-56.keplr.app",
      websocket: "wss://evm-56.keplr.app/websocket",
    },
    chainId: "eip155:56",
    chainName: "BNB Smart Chain",
    chainSymbolImageUrl:
      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:56/chain.png",
    bip44: {
      coinType: 60,
    },
    currencies: [
      {
        coinDenom: "BNB",
        coinMinimalDenom: "binance-native",
        coinDecimals: 18,
        coinGeckoId: "binancecoin",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:56/chain.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "BNB",
        coinMinimalDenom: "binance-native",
        coinDecimals: 18,
        coinGeckoId: "binancecoin",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:56/chain.png",
      },
    ],
    features: [],
  },
  {
    rpc: "https://evm-43114.keplr.app",
    rest: "https://evm-43114.keplr.app",
    evm: {
      chainId: 43114,
      rpc: "https://evm-43114.keplr.app",
      websocket: "wss://evm-43114.keplr.app/websocket",
    },
    chainId: "eip155:43114",
    chainName: "Avalanche",
    chainSymbolImageUrl:
      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:43114/chain.png",
    bip44: {
      coinType: 60,
    },
    currencies: [
      {
        coinDenom: "AVAX",
        coinMinimalDenom: "wei",
        coinDecimals: 18,
        coinGeckoId: "avalanche-2",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:43114/chain.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "AVAX",
        coinMinimalDenom: "wei",
        coinDecimals: 18,
        coinGeckoId: "avalanche-2",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:43114/chain.png",
      },
    ],
    features: [],
  },
  {
    rpc: "https://evm-81457.keplr.app",
    rest: "https://evm-81457.keplr.app",
    evm: {
      chainId: 81457,
      rpc: "https://evm-81457.keplr.app",
      websocket: "wss://evm-81457.keplr.app/websocket",
    },
    chainId: "eip155:81457",
    chainName: "Blast",
    chainSymbolImageUrl:
      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:81457/chain.png",
    bip44: {
      coinType: 60,
    },
    currencies: [
      {
        coinDenom: "ETH",
        coinMinimalDenom: "blast-native",
        coinDecimals: 18,
        coinGeckoId: "ethereum",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "ETH",
        coinMinimalDenom: "blast-native",
        coinDecimals: 18,
        coinGeckoId: "ethereum",
      },
    ],
    features: ["op-stack-l1-data-fee"],
  },
  {
    rpc: "https://rpc-lava.keplr.app",
    rest: "https://lcd-lava.keplr.app",
    chainId: "lava-mainnet-1",
    chainName: "Lava",
    stakeCurrency: {
      coinDenom: "LAVA",
      coinMinimalDenom: "ulava",
      coinDecimals: 6,
      coinGeckoId: "lava-network",
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "lava@",
      bech32PrefixAccPub: "lava@pub",
      bech32PrefixValAddr: "lava@valoper",
      bech32PrefixValPub: "lava@valoperpub",
      bech32PrefixConsAddr: "lava@valcons",
      bech32PrefixConsPub: "lava@valconspub",
    },
    currencies: [
      {
        coinDenom: "LAVA",
        coinMinimalDenom: "ulava",
        coinDecimals: 6,
        coinGeckoId: "lava-network",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "LAVA",
        coinMinimalDenom: "ulava",
        coinDecimals: 6,
        coinGeckoId: "lava-network",
        gasPriceStep: {
          low: 0.00002,
          average: 0.025,
          high: 0.05,
        },
      },
    ],
    features: [],
  },
  {
    chainId: "starknet:SN_MAIN",
    chainName: "Starknet",
    chainSymbolImageUrl:
      "https://keplr-ext-update-note-images.s3.amazonaws.com/token/starknet.png",
    starknet: {
      chainId: "starknet:SN_MAIN",
      rpc: "https://rpc-starknet.keplr.app/rpc/v0_8",
      currencies: [
        {
          type: "erc20",
          contractAddress:
            "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          coinDenom: "ETH",
          coinMinimalDenom:
            "erc20:0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          coinDecimals: 18,
          coinGeckoId: "ethereum",
          coinImageUrl:
            "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:1/ethereum-native.png",
        },
        {
          type: "erc20",
          contractAddress:
            "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
          coinDenom: "STRK",
          coinMinimalDenom:
            "erc20:0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
          coinDecimals: 18,
          coinGeckoId: "starknet",
          coinImageUrl:
            "https://keplr-ext-update-note-images.s3.amazonaws.com/token/starknet.png",
        },
        {
          type: "erc20",
          contractAddress:
            "0x3fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac",
          coinDenom: "WBTC",
          coinMinimalDenom:
            "erc20:0x3fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac",
          coinDecimals: 8,
          coinGeckoId: "wrapped-bitcoin",
          coinImageUrl:
            "https://keplr-ext-update-note-images.s3.amazonaws.com/token/wbtc.png",
        },
        {
          type: "erc20",
          contractAddress:
            "0x42b8f0484674ca266ac5d08e4ac6a3fe65bd3129795def2dca5c34ecc5f96d2",
          coinDenom: "wstETH",
          coinMinimalDenom:
            "erc20:0x42b8f0484674ca266ac5d08e4ac6a3fe65bd3129795def2dca5c34ecc5f96d2",
          coinDecimals: 18,
          coinGeckoId: "wrapped-steth",
          coinImageUrl:
            "https://keplr-ext-update-note-images.s3.amazonaws.com/token/wstETH.png",
        },
        {
          type: "erc20",
          contractAddress:
            "0x68f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8",
          coinDenom: "USDT",
          coinMinimalDenom:
            "erc20:0x68f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8",
          coinDecimals: 6,
          coinGeckoId: "tether",
          coinImageUrl:
            "https://keplr-ext-update-note-images.s3.amazonaws.com/token/usdt.png",
        },
        {
          type: "erc20",
          contractAddress:
            "0x53c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
          coinDenom: "USDC",
          coinMinimalDenom:
            "erc20:0x53c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
          coinDecimals: 6,
          coinGeckoId: "usd-coin",
          coinImageUrl:
            "https://keplr-ext-update-note-images.s3.amazonaws.com/token/usdc.png",
        },
        {
          type: "erc20",
          contractAddress:
            "0x5574eb6b8789a91466f902c380d978e472db68170ff82a5b650b95a58ddf4ad",
          coinDenom: "DAI",
          coinMinimalDenom:
            "erc20:0x5574eb6b8789a91466f902c380d978e472db68170ff82a5b650b95a58ddf4ad",
          coinDecimals: 18,
          coinGeckoId: "dai",
          coinImageUrl:
            "https://keplr-ext-update-note-images.s3.amazonaws.com/token/dai.png",
        },
        {
          type: "erc20",
          contractAddress:
            "0x28d709c875c0ceac3dce7065bec5328186dc89fe254527084d1689910954b0a",
          coinDenom: "xSTRK",
          coinMinimalDenom:
            "erc20:0x28d709c875c0ceac3dce7065bec5328186dc89fe254527084d1689910954b0a",
          coinDecimals: 18,
        },
      ],
      ethContractAddress:
        "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
      strkContractAddress:
        "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
    },
  },
  {
    chainId: "starknet:SN_SEPOLIA",
    chainName: "Starknet Sepolia",
    chainSymbolImageUrl:
      "https://keplr-ext-update-note-images.s3.amazonaws.com/token/starknet.png",
    starknet: {
      chainId: "starknet:SN_SEPOLIA",
      rpc: "https://rpc-starknet-sepolia.keplr.app/rpc/v0_8",
      currencies: [
        {
          type: "erc20",
          contractAddress:
            "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          coinDenom: "ETH",
          coinMinimalDenom:
            "erc20:0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          coinDecimals: 18,
          coinImageUrl:
            "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:1/ethereum-native.png",
        },
        {
          type: "erc20",
          contractAddress:
            "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
          coinDenom: "STRK",
          coinMinimalDenom:
            "erc20:0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
          coinDecimals: 18,
          coinImageUrl:
            "https://keplr-ext-update-note-images.s3.amazonaws.com/token/starknet.png",
        },
      ],
      ethContractAddress:
        "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
      strkContractAddress:
        "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
    },
    isTestnet: true,
  },
  {
    chainId: "mantra-1",
    chainName: "MANTRA",
    chainSymbolImageUrl:
      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/mantra/chain.png",
    rpc: "https://rpc-mantra.keplr.app",
    rest: "https://lcd-mantra.keplr.app",
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "mantra",
      bech32PrefixAccPub: "mantrapub",
      bech32PrefixValAddr: "mantravaloper",
      bech32PrefixValPub: "mantravaloperpub",
      bech32PrefixConsAddr: "mantravalcons",
      bech32PrefixConsPub: "mantravalconspub",
    },
    currencies: [
      {
        coinDenom: "OM",
        coinMinimalDenom: "uom",
        coinDecimals: 6,
        coinGeckoId: "mantra-dao",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/mantra/om.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "OM",
        coinMinimalDenom: "uom",
        coinDecimals: 6,
        coinGeckoId: "mantra-dao",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/mantra/om.png",
        gasPriceStep: {
          low: 0.01,
          average: 0.025,
          high: 0.03,
        },
      },
    ],
    stakeCurrency: {
      coinDenom: "OM",
      coinMinimalDenom: "uom",
      coinDecimals: 6,
      coinGeckoId: "mantra-dao",
      coinImageUrl:
        "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/mantra/om.png",
    },
    features: ["cosmwasm"],
  },
  {
    rpc: "https://rpc-pirin.keplr.app",
    rest: "https://lcd-pirin.keplr.app",
    chainId: "pirin-1",
    chainName: "Nolus",
    chainSymbolImageUrl:
      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/pirin/nolus.png",
    stakeCurrency: {
      coinDenom: "NLS",
      coinMinimalDenom: "unls",
      coinDecimals: 6,
      coinGeckoId: "nolus",
      coinImageUrl:
        "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/pirin/nolus.png",
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "nolus",
      bech32PrefixAccPub: "noluspub",
      bech32PrefixValAddr: "nolusvaloper",
      bech32PrefixValPub: "nolusvaloperpub",
      bech32PrefixConsAddr: "nolusvalcons",
      bech32PrefixConsPub: "nolusvalconspub",
    },
    currencies: [
      {
        coinDenom: "NLS",
        coinMinimalDenom: "unls",
        coinDecimals: 6,
        coinGeckoId: "nolus",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/pirin/nolus.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "NLS",
        coinMinimalDenom: "unls",
        coinDecimals: 6,
        coinGeckoId: "nolus",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/pirin/nolus.png",
        gasPriceStep: {
          low: 0.01,
          average: 0.025,
          high: 0.05,
        },
      },
    ],
    features: ["cosmwasm"],
  },
  {
    rpc: "https://rpc.forma.art",
    rest: "https://rpc.forma.art",
    evm: {
      chainId: 984122,
      rpc: "https://rpc.forma.art",
      websocket: "wss://ws.forma.art",
    },
    chainId: "eip155:984122",
    chainName: "Forma",
    chainSymbolImageUrl:
      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:984122/chain.png",
    bip44: {
      coinType: 60,
    },
    currencies: [
      {
        coinDenom: "TIA",
        coinMinimalDenom: "forma-native",
        coinDecimals: 18,
        coinGeckoId: "celestia",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:984122/utia.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "TIA",
        coinMinimalDenom: "forma-native",
        coinDecimals: 18,
        coinGeckoId: "celestia",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:984122/utia.png",
      },
    ],
    features: [],
  },
  {
    rpc: "https://rpc.flame.astria.org",
    rest: "https://rpc.flame.astria.org",
    evm: {
      chainId: 253368190,
      rpc: "https://rpc.flame.astria.org",
      websocket: "wss://ws.flame.astria.org",
    },
    chainId: "eip155:253368190",
    chainName: "Flame",
    chainSymbolImageUrl:
      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:253368190/chain.png",
    bip44: {
      coinType: 60,
    },
    currencies: [
      {
        coinDenom: "TIA",
        coinMinimalDenom: "flame-native",
        coinDecimals: 18,
        coinGeckoId: "celestia",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:253368190/utia.png",
      },
      {
        coinDenom: "WTIA",
        coinMinimalDenom: "erc20:0x61b7794b6a0cc383b367c327b91e5ba85915a071",
        coinDecimals: 18,
        coinGeckoId: "celestia",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:253368190/wtia.png",
      },
      {
        coinDenom: "USDC",
        coinMinimalDenom: "erc20:0x3f65144f387f6545bf4b19a1b39c94231e1c849f",
        coinDecimals: 6,
        coinGeckoId: "usd-coin",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:253368190/uusdc.png",
      },
      {
        coinDenom: "stTIA",
        coinMinimalDenom: "erc20:0xdf941d092b10ff07eab44bd174dee915c13feccd",
        coinDecimals: 18,
        coinGeckoId: "stride-staked-tia",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:253368190/sttia.png",
      },
      {
        coinDenom: "milkTIA",
        coinMinimalDenom: "erc20:0xcbb93e854aa4ef5db51c3b094f28952ef0dc67be",
        coinDecimals: 18,
        coinGeckoId: "milkyway-staked-tia",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:253368190/milktia.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "TIA",
        coinMinimalDenom: "flame-native",
        coinDecimals: 18,
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:253368190/utia.png",
      },
    ],
    features: [],
  },
  {
    rpc: "https://rpc-xion.keplr.app",
    rest: "https://lcd-xion.keplr.app",
    chainId: "xion-mainnet-1",
    chainName: "Xion",
    chainSymbolImageUrl:
      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/xion-mainnet/chain.png",
    walletUrlForStaking: "https://wallet.keplr.app/chains/xion",
    stakeCurrency: {
      coinDenom: "XION",
      coinMinimalDenom: "uxion",
      coinDecimals: 6,
      coinGeckoId: "xion-2",
      coinImageUrl:
        "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/xion-mainnet/chain.png",
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "xion",
      bech32PrefixAccPub: "xionpub",
      bech32PrefixValAddr: "xionvaloper",
      bech32PrefixValPub: "xionvaloperpub",
      bech32PrefixConsAddr: "xionvalcons",
      bech32PrefixConsPub: "xionvalconspub",
    },
    currencies: [
      {
        coinDenom: "XION",
        coinMinimalDenom: "uxion",
        coinDecimals: 6,
        coinGeckoId: "xion-2",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/xion-mainnet/chain.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "XION",
        coinMinimalDenom: "uxion",
        coinDecimals: 6,
        coinGeckoId: "xion-2",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/xion-mainnet/chain.png",
        gasPriceStep: {
          low: 0.0005,
          average: 0.001,
          high: 0.002,
        },
      },
    ],
    features: ["cosmwasm"],
  },
  {
    chainId: "jackal-1",
    chainName: "Jackal",
    chainSymbolImageUrl:
      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/jackal/chain.png",
    rpc: "https://rpc-jackal.keplr.app",
    rest: "https://lcd-jackal.keplr.app",
    walletUrlForStaking: "https://wallet.keplr.app/chains/jackal",
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "jkl",
      bech32PrefixAccPub: "jklpub",
      bech32PrefixValAddr: "jklvaloper",
      bech32PrefixValPub: "jklvaloperpub",
      bech32PrefixConsAddr: "jklvalcons",
      bech32PrefixConsPub: "jklvalconspub",
    },
    currencies: [
      {
        coinDenom: "JKL",
        coinMinimalDenom: "ujkl",
        coinDecimals: 6,
        coinGeckoId: "jackal-protocol",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/jackal/chain.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "JKL",
        coinMinimalDenom: "ujkl",
        coinDecimals: 6,
        coinGeckoId: "jackal-protocol",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/jackal/chain.png",
        gasPriceStep: {
          low: 0.002,
          average: 0.004,
          high: 0.02,
        },
      },
    ],
    stakeCurrency: {
      coinDenom: "JKL",
      coinMinimalDenom: "ujkl",
      coinDecimals: 6,
      coinGeckoId: "jackal-protocol",
      coinImageUrl:
        "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/jackal/chain.png",
    },
    features: ["cosmwasm"],
  },
  {
    chainId: "thorchain-1",
    chainName: "THORChain",
    chainSymbolImageUrl:
      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/thorchain/chain.png",
    rpc: "https://rpc-thorchain.keplr.app",
    rest: "https://lcd-thorchain.keplr.app",
    bip44: {
      coinType: 931,
    },
    bech32Config: {
      bech32PrefixAccAddr: "thor",
      bech32PrefixAccPub: "thorpub",
      bech32PrefixValAddr: "thorvaloper",
      bech32PrefixValPub: "thorvaloperpub",
      bech32PrefixConsAddr: "thorvalcons",
      bech32PrefixConsPub: "thorvalconspub",
    },
    currencies: [
      {
        coinDenom: "RUNE",
        coinMinimalDenom: "rune",
        coinDecimals: 8,
        coinGeckoId: "thorchain",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/thorchain/rune.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "RUNE",
        coinMinimalDenom: "rune",
        coinDecimals: 8,
        coinGeckoId: "thorchain",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/thorchain/rune.png",
        gasPriceStep: {
          low: 0.02,
          average: 0.02,
          high: 0.03,
        },
      },
    ],
    features: [],
  },
  {
    chainId: "elys-1",
    chainName: "Elys Network",
    chainSymbolImageUrl:
      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/elys/chain.png",
    rpc: "https://rpc-elys.keplr.app",
    rest: "https://lcd-elys.keplr.app",
    walletUrlForStaking: "https://wallet.keplr.app/chains/elys-network",
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "elys",
      bech32PrefixAccPub: "elyspub",
      bech32PrefixValAddr: "elysvaloper",
      bech32PrefixValPub: "elysvaloperpub",
      bech32PrefixConsAddr: "elysvalcons",
      bech32PrefixConsPub: "elysvalconspub",
    },
    currencies: [
      {
        coinDenom: "ELYS",
        coinMinimalDenom: "uelys",
        coinDecimals: 6,
        coinGeckoId: "elys-network",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/elys/chain.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "ELYS",
        coinMinimalDenom: "uelys",
        coinDecimals: 6,
        gasPriceStep: {
          low: 0.01,
          average: 0.025,
          high: 0.03,
        },
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/elys/chain.png",
      },
      {
        coinDenom: "USDC",
        coinMinimalDenom:
          "ibc/F082B65C88E4B6D5EF1DB243CDA1D331D002759E938A0F5CD3FFDC5D53B3E349",
        coinDecimals: 6,
        coinGeckoId: "usd-coin",
        gasPriceStep: {
          low: 0.01,
          average: 0.025,
          high: 0.03,
        },
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/elys/uusdc.png",
      },
      {
        coinDenom: "ATOM",
        coinMinimalDenom:
          "ibc/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9",
        coinDecimals: 6,
        coinGeckoId: "cosmos",
        gasPriceStep: {
          low: 0.01,
          average: 0.025,
          high: 0.03,
        },
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/elys/uatom.png",
      },
    ],
    stakeCurrency: {
      coinDenom: "ELYS",
      coinMinimalDenom: "uelys",
      coinDecimals: 6,
      coinImageUrl:
        "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/elys/chain.png",
    },
    features: [],
  },
  {
    rpc: "https://rpc.derive.xyz/",
    rest: "https://rpc.derive.xyz/",
    evm: {
      chainId: 957,
      rpc: "https://rpc.derive.xyz/",
      websocket: "wss://rpc.derive.xyz/",
    },
    chainId: "eip155:957",
    chainName: "Derive",
    bip44: {
      coinType: 60,
    },
    currencies: [
      {
        coinDenom: "ETH",
        coinMinimalDenom: "derive-ethereum",
        coinDecimals: 18,
        coinGeckoId: "ethereum",
      },
      {
        type: "erc20",
        contractAddress: "0xb1d1eae60eea9525032a6dcb4c1ce336a1de71be",
        coinDenom: "DRV",
        coinMinimalDenom: "erc20:0xb1d1eae60eea9525032a6dcb4c1ce336a1de71be",
        coinDecimals: 18,
        coinGeckoId: "derive",
      },
      {
        type: "erc20",
        contractAddress: "0x7499d654422023a407d92e1D83D387d81BC68De1",
        coinDenom: "stDRV",
        coinMinimalDenom: "erc20:0x7499d654422023a407d92e1D83D387d81BC68De1",
        coinDecimals: 18,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "ETH",
        coinMinimalDenom: "derive-ethereum",
        coinDecimals: 18,
        coinGeckoId: "ethereum",
      },
    ],
    features: ["op-stack-l1-data-fee"],
  },
  {
    rpc: "https://evm-80094.keplr.app",
    rest: "https://evm-80094.keplr.app",
    evm: {
      chainId: 80094,
      rpc: "https://evm-80094.keplr.app",
      websocket: "wss://evm-80094.keplr.app",
    },
    chainId: "eip155:80094",
    chainName: "Berachain",
    chainSymbolImageUrl:
      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:80094/chain.png",
    bip44: {
      coinType: 60,
    },
    currencies: [
      {
        coinDenom: "BERA",
        coinMinimalDenom: "berachain-native",
        coinDecimals: 18,
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:80094/berachain-native.png",
      },
      {
        coinDenom: "BGT",
        coinMinimalDenom: "erc20:0x656b95E550C07a9ffe548bd4085c72418Ceb1dba",
        coinDecimals: 18,
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:80094/erc20/0x656b95E550C07a9ffe548bd4085c72418Ceb1dba.png",
      },
      {
        coinDenom: "HONEY",
        coinMinimalDenom: "erc20:0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce",
        coinDecimals: 18,
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:80094/erc20/0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "BERA",
        coinMinimalDenom: "berachain-native",
        coinDecimals: 18,
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:80094/berachain-native.png",
      },
    ],
    features: [],
  },
  {
    rpc: "https://evm-1514.keplr.app",
    rest: "https://evm-1514.keplr.app",
    evm: {
      chainId: 1514,
      rpc: "https://evm-1514.keplr.app",
      websocket: "wss://evm-1514.keplr.app/websocket",
    },
    chainId: "eip155:1514",
    chainName: "Story",
    chainSymbolImageUrl:
      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:1514/chain.png",
    bip44: {
      coinType: 60,
    },
    currencies: [
      {
        coinDenom: "IP",
        coinMinimalDenom: "story-native",
        coinDecimals: 18,
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:1514/story-native.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "IP",
        coinMinimalDenom: "story-native",
        coinDecimals: 18,
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:1514/story-native.png",
      },
    ],
    features: [],
  },
  {
    rpc: "https://evm-130.keplr.app",
    rest: "https://evm-130.keplr.app",
    evm: {
      chainId: 130,
      rpc: "https://evm-130.keplr.app",
      websocket: "wss://evm-130.keplr.app/websocket",
    },
    chainId: "eip155:130",
    chainName: "Unichain",
    chainSymbolImageUrl:
      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:130/chain.png",
    bip44: {
      coinType: 60,
    },
    currencies: [
      {
        coinDenom: "ETH",
        coinMinimalDenom: "unichain-native",
        coinDecimals: 18,
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:130/unichain-native.png",
        coinGeckoId: "ethereum",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "ETH",
        coinMinimalDenom: "unichain-native",
        coinDecimals: 18,
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:130/unichain-native.png",
        coinGeckoId: "ethereum",
      },
    ],
    features: ["op-stack-l1-data-fee"],
  },
  {
    chainId:
      "bip122:000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f:taproot",
    chainName: "Bitcoin",
    chainSymbolImageUrl:
      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/bitcoin/mainnet.png",
    linkedChainKey:
      "bip122:000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f",
    bitcoin: {
      chainId:
        "bip122:000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f",
      rpc: "",
      rest: "https://api-indexer-bitcoin.keplr.app",
      bip44: {
        coinType: 0,
        purpose: 86,
      },
      currencies: [
        {
          coinDenom: "BTC",
          coinMinimalDenom: "sats",
          coinDecimals: 8,
          coinGeckoId: "bitcoin",
          coinImageUrl:
            "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/bitcoin/mainnet.png",
        },
      ],
    },
  },
  {
    chainId:
      "bip122:000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f:native-segwit",
    chainName: "Bitcoin",
    chainSymbolImageUrl:
      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/bitcoin/mainnet.png",
    linkedChainKey:
      "bip122:000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f",
    bitcoin: {
      chainId:
        "bip122:000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f",
      rpc: "",
      rest: "https://api-indexer-bitcoin.keplr.app",
      bip44: {
        coinType: 0,
        purpose: 84,
      },
      currencies: [
        {
          coinDenom: "BTC",
          coinMinimalDenom: "sats",
          coinDecimals: 8,
          coinGeckoId: "bitcoin",
          coinImageUrl:
            "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/bitcoin/mainnet.png",
        },
      ],
    },
  },
  {
    chainId:
      "bip122:000000000933ea01ad0ee984209779baaec3ced90fa3f408719526f8d77f4943:taproot",
    chainName: "Bitcoin Testnet",
    chainSymbolImageUrl:
      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/bitcoin/testnet.png",
    linkedChainKey:
      "bip122:000000000933ea01ad0ee984209779baaec3ced90fa3f408719526f8d77f4943",
    bitcoin: {
      chainId:
        "bip122:000000000933ea01ad0ee984209779baaec3ced90fa3f408719526f8d77f4943",
      rpc: "",
      rest: "https://blockstream.info/testnet/api",
      bip44: {
        coinType: 1,
        purpose: 86,
      },
      currencies: [
        {
          coinDenom: "tBTC",
          coinMinimalDenom: "sats-testnet",
          coinDecimals: 8,
          coinImageUrl:
            "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/bitcoin/testnet.png",
        },
      ],
    },
    isTestnet: true,
  },
  {
    chainId:
      "bip122:000000000933ea01ad0ee984209779baaec3ced90fa3f408719526f8d77f4943:native-segwit",
    chainName: "Bitcoin Testnet",
    chainSymbolImageUrl:
      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/bitcoin/testnet.png",
    linkedChainKey:
      "bip122:000000000933ea01ad0ee984209779baaec3ced90fa3f408719526f8d77f4943",
    bitcoin: {
      chainId:
        "bip122:000000000933ea01ad0ee984209779baaec3ced90fa3f408719526f8d77f4943",
      rpc: "",
      rest: "https://blockstream.info/testnet/api",
      bip44: {
        coinType: 1,
        purpose: 84,
      },
      currencies: [
        {
          coinDenom: "tBTC",
          coinMinimalDenom: "sats-testnet",
          coinDecimals: 8,
          coinImageUrl:
            "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/bitcoin/testnet.png",
        },
      ],
    },
    isTestnet: true,
  },
  {
    chainId:
      "bip122:00000008819873e925422c1ff0f99f7cc9bbb232af63a077a480a3633bee1ef6:taproot",
    chainName: "Bitcoin Signet",
    chainSymbolImageUrl:
      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/bitcoin/signet.png",
    linkedChainKey:
      "bip122:00000008819873e925422c1ff0f99f7cc9bbb232af63a077a480a3633bee1ef6",
    bitcoin: {
      chainId:
        "bip122:00000008819873e925422c1ff0f99f7cc9bbb232af63a077a480a3633bee1ef6",
      rpc: "",
      rest: "https://explorer.bc-2.jp/api",
      bip44: {
        coinType: 1,
        purpose: 86,
      },
      currencies: [
        {
          coinDenom: "sBTC",
          coinMinimalDenom: "sats-signet",
          coinDecimals: 8,
          coinImageUrl:
            "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/bitcoin/signet.png",
        },
      ],
    },
    isTestnet: true,
  },
  {
    chainId:
      "bip122:00000008819873e925422c1ff0f99f7cc9bbb232af63a077a480a3633bee1ef6:native-segwit",
    chainName: "Bitcoin Signet",
    chainSymbolImageUrl:
      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/bitcoin/signet.png",
    linkedChainKey:
      "bip122:00000008819873e925422c1ff0f99f7cc9bbb232af63a077a480a3633bee1ef6",
    bitcoin: {
      chainId:
        "bip122:00000008819873e925422c1ff0f99f7cc9bbb232af63a077a480a3633bee1ef6",
      rpc: "",
      rest: "https://explorer.bc-2.jp/api",
      bip44: {
        coinType: 1,
        purpose: 84,
      },
      currencies: [
        {
          coinDenom: "sBTC",
          coinMinimalDenom: "sats-signet",
          coinDecimals: 8,
          coinImageUrl:
            "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/bitcoin/signet.png",
        },
      ],
    },
    isTestnet: true,
  },
  {
    rpc: "https://rpc-nillion.keplr.app",
    rest: "https://lcd-nillion.keplr.app",
    chainId: "nillion-1",
    chainName: "Nillion",
    chainSymbolImageUrl:
      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/nillion/nil.png",
    stakeCurrency: {
      coinDenom: "NIL",
      coinMinimalDenom: "unil",
      coinDecimals: 6,
      coinGeckoId: "nillion",
      coinImageUrl:
        "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/nillion/nil.png",
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "nillion",
      bech32PrefixAccPub: "nillionpub",
      bech32PrefixValAddr: "nillionvaloper",
      bech32PrefixValPub: "nillionvaloperpub",
      bech32PrefixConsAddr: "nillionvalcons",
      bech32PrefixConsPub: "nillionvalconspub",
    },
    currencies: [
      {
        coinDenom: "NIL",
        coinMinimalDenom: "unil",
        coinDecimals: 6,
        coinGeckoId: "nillion",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/nillion/nil.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "NIL",
        coinMinimalDenom: "unil",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/nillion/nil.png",
        gasPriceStep: {
          low: 0.001,
          average: 0.001,
          high: 0.01,
        },
      },
    ],
    features: [],
  },
  {
    chainId: "bbn-1",
    chainName: "Babylon Genesis",
    chainSymbolImageUrl:
      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/bbn/chain.png",
    rpc: "https://rpc-babylon.keplr.app",
    rest: "https://lcd-babylon.keplr.app",
    walletUrlForStaking: "https://wallet.keplr.app/chains/babylon-genesis",
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "bbn",
      bech32PrefixAccPub: "bbnpub",
      bech32PrefixValAddr: "bbnvaloper",
      bech32PrefixValPub: "bbnvaloperpub",
      bech32PrefixConsAddr: "bbnvalcons",
      bech32PrefixConsPub: "bbnvalconspub",
    },
    currencies: [
      {
        coinDenom: "BABY",
        coinMinimalDenom: "ubbn",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/bbn/chain.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "BABY",
        coinMinimalDenom: "ubbn",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/bbn/chain.png",
        gasPriceStep: {
          low: 0.007,
          average: 0.007,
          high: 0.01,
        },
      },
    ],
    stakeCurrency: {
      coinDenom: "BABY",
      coinMinimalDenom: "ubbn",
      coinDecimals: 6,
      coinImageUrl:
        "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/bbn/chain.png",
    },
    features: ["cosmwasm"],
  },
  {
    rpc: "https://rpc.initia.xyz",
    rest: "https://rest.initia.xyz",
    chainId: "interwoven-1",
    chainName: "Initia",
    walletUrlForStaking: "https://testnet.keplr.app/chains/initia",
    bip44: {
      coinType: 60,
    },
    bech32Config: {
      bech32PrefixAccAddr: "init",
      bech32PrefixAccPub: "initpub",
      bech32PrefixValAddr: "initvaloper",
      bech32PrefixValPub: "initvaloperpub",
      bech32PrefixConsAddr: "initvalcons",
      bech32PrefixConsPub: "initvalconspub",
    },
    currencies: [
      {
        coinDenom: "INIT",
        coinMinimalDenom: "uinit",
        coinDecimals: 6,
      },
    ],
    stakeCurrency: {
      coinDenom: "INIT",
      coinMinimalDenom: "uinit",
      coinDecimals: 6,
    },
    feeCurrencies: [
      {
        coinDenom: "INIT",
        coinMinimalDenom: "uinit",
        coinDecimals: 6,
        gasPriceStep: {
          low: 0.015,
          average: 0.02,
          high: 0.3,
        },
      },
    ],
    features: [
      "force-enable-evm-ledger",
      "eth-address-gen",
      "eth-key-sign",
      "initia-dynamicfee",
      "eth-secp256k1-initia",
      "evm-ledger-sign-plain-json",
    ],
  },
  {
    rpc: "https://rpc.mainnet.milkyway.zone",
    rest: "https://lcd.mainnet.milkyway.zone",
    chainId: "milkyway",
    chainName: "MilkyWay",
    chainSymbolImageUrl:
      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/milkyway/chain.png",
    nodeProvider: {
      name: "MilkyWay Labs",
      email: "development@milkyway.zone",
    },
    stakeCurrency: {
      coinDenom: "MILK",
      coinMinimalDenom: "umilk",
      coinDecimals: 6,
      coinImageUrl:
        "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/milkyway/umilk.png",
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "milk",
      bech32PrefixAccPub: "milkpub",
      bech32PrefixValAddr: "milkvaloper",
      bech32PrefixValPub: "milkvaloperpub",
      bech32PrefixConsAddr: "milkvalcons",
      bech32PrefixConsPub: "milkvalconspub",
    },
    currencies: [
      {
        coinDenom: "MILK",
        coinMinimalDenom: "umilk",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/milkyway/umilk.png",
      },
      {
        coinDenom: "milkBABY",
        coinMinimalDenom:
          "factory/milk1qg5ega6dykkxc307y25pecuufrjkxkaggkkxh7nad0vhyhtuhw3ssgcye4/umilkBBN",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/milkyway/milkbaby.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "MILK",
        coinMinimalDenom: "umilk",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/milkyway/milk.png",
        gasPriceStep: {
          low: 0.01,
          average: 0.015,
          high: 0.02,
        },
      },
    ],
    features: ["cosmwasm"],
  },
  {
    rpc: "https://rpc-atomone.keplr.app",
    rest: "https://lcd-atomone.keplr.app",
    chainId: "atomone-1",
    chainName: "AtomOne",
    chainSymbolImageUrl:
      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/atomone/chain.png",
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "atone",
      bech32PrefixAccPub: "atonepub",
      bech32PrefixValAddr: "atonevaloper",
      bech32PrefixValPub: "atonevaloperpub",
      bech32PrefixConsAddr: "atonevalcons",
      bech32PrefixConsPub: "atonevalconspub",
    },
    currencies: [
      {
        coinDenom: "ATONE",
        coinMinimalDenom: "uatone",
        coinDecimals: 6,
        coinGeckoId: "atomone",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/atomone/chain.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "ATONE",
        coinMinimalDenom: "uatone",
        coinDecimals: 6,
        coinGeckoId: "atomone",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/atomone/chain.png",
        gasPriceStep: {
          low: 0.025,
          average: 0.04,
          high: 0.08,
        },
      },
    ],
    stakeCurrency: {
      coinDenom: "ATONE",
      coinMinimalDenom: "uatone",
      coinGeckoId: "atomone",
      coinDecimals: 6,
      coinImageUrl:
        "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/atomone/chain.png",
    },
    features: [],
  },
  {
    chainId: "pocket",
    chainName: "Pocket Network",
    chainSymbolImageUrl:
      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/pocket/chain.png",
    rpc: "https://rpc-pocket.keplr.app",
    rest: "https://lcd-pocket.keplr.app",
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "pokt",
      bech32PrefixAccPub: "poktpub",
      bech32PrefixValAddr: "poktvaloper",
      bech32PrefixValPub: "poktvaloperpub",
      bech32PrefixConsAddr: "poktvalcons",
      bech32PrefixConsPub: "poktvalconspub",
    },
    currencies: [
      {
        coinDenom: "POKT",
        coinMinimalDenom: "upokt",
        coinDecimals: 6,
        coinGeckoId: "pocket-network",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/pocket/chain.png",
      },
      {
        coinDenom: "MACT",
        coinMinimalDenom: "umact",
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "POKT",
        coinMinimalDenom: "upokt",
        coinDecimals: 6,
        gasPriceStep: {
          low: 0.01,
          average: 0.01,
          high: 0.01,
        },
      },
      {
        coinDenom: "MACT",
        coinMinimalDenom: "umact",
        coinDecimals: 6,
        gasPriceStep: {
          low: 0.01,
          average: 0.01,
          high: 0.01,
        },
      },
    ],
    stakeCurrency: {
      coinDenom: "POKT",
      coinMinimalDenom: "upokt",
      coinDecimals: 6,
    },
    features: [],
  },
  {
    rpc: "https://rpc-xrplevm.keplr.app",
    rest: "https://lcd-xrplevm.keplr.app",
    chainId: "xrplevm_1440000-1",
    chainName: "XRPL EVM",
    chainSymbolImageUrl:
      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/xrplevm_1440000/chain.png",
    bip44: {
      coinType: 60,
    },
    bech32Config: {
      bech32PrefixAccAddr: "ethm",
      bech32PrefixAccPub: "ethmpub",
      bech32PrefixValAddr: "ethmvaloper",
      bech32PrefixValPub: "ethmvaloperpub",
      bech32PrefixConsAddr: "ethmvalcons",
      bech32PrefixConsPub: "ethmvalcons",
    },
    currencies: [
      {
        coinDenom: "XRP",
        coinMinimalDenom: "axrp",
        coinGeckoId: "ripple",
        coinDecimals: 18,
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/xrplevm_1440000/xrp-logo.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "XRP",
        coinMinimalDenom: "axrp",
        coinDecimals: 18,
        coinGeckoId: "ripple",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/xrplevm_1440000/xrp-logo.png",
        gasPriceStep: {
          low: 200000000000,
          average: 250000000000,
          high: 400000000000,
        },
      },
    ],
    features: ["eth-address-gen", "eth-key-sign", "axelar-evm-bridge"],
  },
  {
    rpc: "https://rpc.testnet.citrea.xyz",
    rest: "https://rpc.testnet.citrea.xyz",
    evm: {
      chainId: 5115,
      rpc: "https://rpc.testnet.citrea.xyz",
      websocket: "wss://rpc.testnet.citrea.xyz",
    },
    chainId: "eip155:5115",
    chainName: "Citrea Testnet",
    chainSymbolImageUrl:
      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:5115/citrea-black.png",
    bip44: {
      coinType: 60,
    },
    currencies: [
      {
        coinDenom: "cBTC",
        coinMinimalDenom: "cbtc",
        coinDecimals: 18,
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:5115/cbtc.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "cBTC",
        coinMinimalDenom: "cbtc",
        coinDecimals: 18,
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:5115/cbtc.png",
      },
    ],
    features: [],
  },
  {
    rpc: "https://rpc.gravity.xyz",
    rest: "https://rpc.gravity.xyz",
    evm: {
      chainId: 1625,
      rpc: "https://rpc.gravity.xyz",
      websocket: "wss://rpc.gravity.xyz",
    },
    chainId: "eip155:1625",
    chainName: "Gravity Alpha Mainnet",
    chainSymbolImageUrl:
      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:1625/chain.png",
    bip44: {
      coinType: 60,
    },
    currencies: [
      {
        coinDenom: "G",
        coinMinimalDenom: "gravity-native",
        coinDecimals: 18,
        coinGeckoId: "g-token",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:1625/chain.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "G",
        coinMinimalDenom: "gravity-native",
        coinDecimals: 18,
        coinGeckoId: "g-token",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:1625/chain.png",
      },
    ],
    features: [],
  },
  {
    rpc: "https://evm-57073.keplr.app",
    rest: "https://evm-57073.keplr.app",
    evm: {
      chainId: 57073,
      rpc: "https://evm-57073.keplr.app",
      websocket: "wss://evm-57073.keplr.app/websocket",
    },
    chainId: "eip155:57073",
    chainName: "Ink",
    chainSymbolImageUrl:
      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:57073/chain.png",
    bip44: {
      coinType: 60,
    },
    currencies: [
      {
        coinDenom: "ETH",
        coinMinimalDenom: "ink-native",
        coinDecimals: 18,
        coinGeckoId: "ethereum",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:57073/ink-native.png",
      },
      {
        coinDenom: "USDC.e",
        coinMinimalDenom: "erc20:0xF1815bd50389c46847f0Bda824eC8da914045D14",
        coinDecimals: 6,
        coinGeckoId: "stargate-bridged-usdc-ink",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:57073/erc20/0xF1815bd50389c46847f0Bda824eC8da914045D14.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "ETH",
        coinMinimalDenom: "ink-native",
        coinDecimals: 18,
        coinGeckoId: "ethereum",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:57073/ink-native.png",
      },
    ],
    features: ["op-stack-l1-data-fee"],
  },
  {
    rpc: "https://evm-59144.keplr.app",
    rest: "https://evm-59144.keplr.app",
    evm: {
      chainId: 59144,
      rpc: "https://evm-59144.keplr.app",
      websocket: "wss://evm-59144.keplr.app/websocket",
    },
    chainId: "eip155:59144",
    chainName: "Linea",
    chainSymbolImageUrl:
      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:59144/chain.png",
    bip44: {
      coinType: 60,
    },
    currencies: [
      {
        coinDenom: "ETH",
        coinMinimalDenom: "linea-native",
        coinDecimals: 18,
        coinGeckoId: "ethereum",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:59144/linea-native.png",
      },
      {
        coinDenom: "USDC",
        coinMinimalDenom: "erc20:0x176211869cA2b568f2A7D4EE941E073a821EE1ff",
        coinDecimals: 6,
        coinGeckoId: "usd-coin",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:59144/erc20/0x176211869cA2b568f2A7D4EE941E073a821EE1ff.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "ETH",
        coinMinimalDenom: "linea-native",
        coinDecimals: 18,
        coinGeckoId: "ethereum",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/eip155:59144/linea-native.png",
      },
    ],
    features: [],
  },
  {
    chainId: "union-1",
    chainName: "Union",
    chainSymbolImageUrl:
      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/union/chain.png",
    rpc: "https://rpc-union.keplr.app",
    rest: "https://lcd-union.keplr.app",
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "union",
      bech32PrefixAccPub: "unionpub",
      bech32PrefixValAddr: "unionvaloper",
      bech32PrefixValPub: "unionvaloperpub",
      bech32PrefixConsAddr: "unionvalcons",
      bech32PrefixConsPub: "unionvalconspub",
    },
    currencies: [
      {
        coinDenom: "U",
        coinMinimalDenom: "au",
        coinDecimals: 18,
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/union/chain.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "U",
        coinMinimalDenom: "au",
        coinDecimals: 18,
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/union/chain.png",
        gasPriceStep: {
          low: 100000000,
          average: 100000000,
          high: 200000000,
        },
      },
    ],
    stakeCurrency: {
      coinDenom: "U",
      coinMinimalDenom: "au",
      coinDecimals: 18,
      coinImageUrl:
        "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/union/chain.png",
    },
    features: ["cosmwasm"],
    walletUrlForStaking: "https://wallet.keplr.app/chains/union",
  },
];

// The origins that are able to pass any permission that external webpages can have.
export const PrivilegedOrigins: string[] = [
  "https://wallet.keplr.app",
  "https://validator.keplr.app",
  "https://chains.keplr.app",
  "https://testnet.keplr.app",
  "https://multisig.keplr.app",
];

export const MsgPrivilegedContractMap: Record<
  string,
  Record<string, string[]>
> = {
  pion: {
    neutron1h62p45vv3fg2q6sm00r93gqgmhqt9tfgq5hz33qyrhq8f0pqqj0s36wgc3: [
      "claim_rewards",
    ],
  },
  neutron: {
    neutron1gqq3c735pj6ese3yru5xr6ud0fvxgltxesygvyyzpsrt74v6yg4sgkrgwq: [
      "claim_rewards",
    ],
  },
};

export const CommunityChainInfoRepo = {
  organizationName: "chainapsis",
  repoName: "keplr-chain-registry",
  branchName: "main",
  alternativeURL: process.env["KEPLR_EXT_CHAIN_REGISTRY_URL"]
    ? process.env["KEPLR_EXT_CHAIN_REGISTRY_URL"]
    : undefined,
};

export const TokenContractListURL =
  "https://opbaqquqruxn7fdsgcncrtfrwa0qxnoj.lambda-url.us-west-2.on.aws";
