import { Bech32Address } from "@keplr-wallet/cosmos";
import { ChainInfo } from "@keplr-wallet/types";

export const CoinGeckoAPIEndPoint = "https://api.coingecko.com/api/v3";

export const EthereumEndpoint =
  "https://mainnet.infura.io/v3/eeb00e81cdb2410098d5a270eff9b341";

export interface AppChainInfo extends ChainInfo {
  readonly chainSymbolImageUrl?: string;
  readonly hideInUI?: boolean;
  readonly txExplorer?: {
    readonly name: string;
    readonly txUrl: string;
  };
}

export const EmbedChainInfos: AppChainInfo[] = [
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
      coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/atom.png",
    },
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
        coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/atom.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "ATOM",
        coinMinimalDenom: "uatom",
        coinDecimals: 6,
        coinGeckoId: "cosmos",
        coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/atom.png",
      },
    ],
    coinType: 118,
    features: ["ibc-transfer", "ibc-go"],
    chainSymbolImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/atom.png",
    txExplorer: {
      name: "Mintscan",
      txUrl: "https://www.mintscan.io/cosmos/txs/{txHash}",
    },
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
      coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/osmo.png",
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("osmo"),
    currencies: [
      {
        coinDenom: "OSMO",
        coinMinimalDenom: "uosmo",
        coinDecimals: 6,
        coinGeckoId: "osmosis",
        coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/osmo.png",
      },
      {
        coinDenom: "ION",
        coinMinimalDenom: "uion",
        coinDecimals: 6,
        coinGeckoId: "ion",
        coinImageUrl:
          "https://dhj8dql1kzq2v.cloudfront.net/white/osmosis-ion.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "OSMO",
        coinMinimalDenom: "uosmo",
        coinDecimals: 6,
        coinGeckoId: "osmosis",
        coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/osmo.png",
        gasPriceStep: {
          low: 0,
          average: 0.025,
          high: 0.04,
        },
      },
    ],
    coinType: 118,
    features: [
      "ibc-transfer",
      "ibc-go",
      "cosmwasm",
      "wasmd_0.24+",
      "osmosis-txfees",
    ],
    chainSymbolImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/osmo.png",
    txExplorer: {
      name: "Mintscan",
      txUrl: "https://www.mintscan.io/osmosis/txs/{txHash}",
    },
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
      coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/secret.png",
    },
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
        coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/secret.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "SCRT",
        coinMinimalDenom: "uscrt",
        coinDecimals: 6,
        coinGeckoId: "secret",
        coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/secret.png",
        gasPriceStep: {
          low: 0.1,
          average: 0.25,
          high: 0.3,
        },
      },
    ],
    coinType: 529,
    chainSymbolImageUrl:
      "https://dhj8dql1kzq2v.cloudfront.net/white/secret.png",
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
      coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/akash.png",
    },
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
        coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/akash.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "AKT",
        coinMinimalDenom: "uakt",
        coinDecimals: 6,
        coinGeckoId: "akash-network",
        coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/akash.png",
      },
    ],
    chainSymbolImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/akash.png",
    features: ["ibc-transfer"],
    hideInUI: true,
  },
  {
    rpc: "https://rpc-iov.keplr.app",
    rest: "https://lcd-iov.keplr.app",
    chainId: "iov-mainnet-ibc",
    chainName: "Starname",
    stakeCurrency: {
      coinDenom: "IOV",
      coinMinimalDenom: "uiov",
      coinDecimals: 6,
      coinGeckoId: "starname",
      coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/starname.png",
    },
    bip44: {
      coinType: 234,
    },
    bech32Config: Bech32Address.defaultBech32Config("star"),
    currencies: [
      {
        coinDenom: "IOV",
        coinMinimalDenom: "uiov",
        coinDecimals: 6,
        coinGeckoId: "starname",
        coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/starname.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "IOV",
        coinMinimalDenom: "uiov",
        coinDecimals: 6,
        coinGeckoId: "starname",
        coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/starname.png",
        gasPriceStep: {
          low: 1,
          average: 2,
          high: 3,
        },
      },
    ],
    chainSymbolImageUrl:
      "https://dhj8dql1kzq2v.cloudfront.net/white/starname.png",
    features: ["ibc-transfer"],
    hideInUI: true,
  },
  {
    rpc: "https://rpc-sifchain.keplr.app",
    rest: "https://lcd-sifchain.keplr.app/",
    chainId: "sifchain-1",
    chainName: "Sifchain",
    stakeCurrency: {
      coinDenom: "ROWAN",
      coinMinimalDenom: "rowan",
      coinDecimals: 18,
      coinGeckoId: "sifchain",
      coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/sifchain.png",
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("sif"),
    currencies: [
      {
        coinDenom: "ROWAN",
        coinMinimalDenom: "rowan",
        coinDecimals: 18,
        coinGeckoId: "sifchain",
        coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/sifchain.png",
      },
      {
        coinDenom: "Tether USDT",
        coinMinimalDenom: "cusdt",
        coinDecimals: 6,
      },
      {
        coinDenom: "Ethereum",
        coinMinimalDenom: "ceth",
        coinDecimals: 18,
      },
      {
        coinDenom: "Basic Attention Token",
        coinMinimalDenom: "cbat",
        coinDecimals: 18,
      },
      {
        coinDenom: "Aragon",
        coinMinimalDenom: "cant",
        coinDecimals: 18,
      },
      {
        coinDenom: "Bancor Network Token",
        coinMinimalDenom: "cbnt",
        coinDecimals: 18,
      },
      {
        coinDenom: "0x",
        coinMinimalDenom: "czrx",
        coinDecimals: 18,
      },
      {
        coinDenom: "Chainlink",
        coinMinimalDenom: "clink",
        coinDecimals: 18,
      },
      {
        coinDenom: "Decentraland",
        coinMinimalDenom: "cmana",
        coinDecimals: 18,
      },
      {
        coinDenom: "Loopring",
        coinMinimalDenom: "clrc",
        coinDecimals: 18,
      },
      {
        coinDenom: "Enjin Coin",
        coinMinimalDenom: "cenj",
        coinDecimals: 18,
      },
      {
        coinDenom: "Synthetix Network Token",
        coinMinimalDenom: "csnx",
        coinDecimals: 18,
      },
      {
        coinDenom: "TrueUSD",
        coinMinimalDenom: "ctusd",
        coinDecimals: 18,
      },
      {
        coinDenom: "Ocean Protocol",
        coinMinimalDenom: "cocean",
        coinDecimals: 18,
      },
      {
        coinDenom: "Fantom",
        coinMinimalDenom: "cftm",
        coinDecimals: 18,
      },
      {
        coinDenom: "sUSD",
        coinMinimalDenom: "csusd",
        coinDecimals: 18,
      },
      {
        coinDenom: "USD Coin",
        coinMinimalDenom: "cusdc",
        coinDecimals: 6,
      },
      {
        coinDenom: "Crypto com Coin",
        coinMinimalDenom: "ccro",
        coinDecimals: 8,
      },
      {
        coinDenom: "Wrapped Bitcoin",
        coinMinimalDenom: "cwbtc",
        coinDecimals: 8,
      },
      {
        coinDenom: "Swipe",
        coinMinimalDenom: "csxp",
        coinDecimals: 18,
      },
      {
        coinDenom: "Band Protocol",
        coinMinimalDenom: "cband",
        coinDecimals: 18,
      },
      {
        coinDenom: "Dai Stablecoin",
        coinMinimalDenom: "cdai",
        coinDecimals: 18,
      },
      {
        coinDenom: "Compound",
        coinMinimalDenom: "ccomp",
        coinDecimals: 18,
      },
      {
        coinDenom: "UMA",
        coinMinimalDenom: "cuma",
        coinDecimals: 18,
      },
      {
        coinDenom: "Balancer",
        coinMinimalDenom: "cbal",
        coinDecimals: 18,
      },
      {
        coinDenom: "Yearn finance",
        coinMinimalDenom: "cyfi",
        coinDecimals: 18,
      },
      {
        coinDenom: "Serum",
        coinMinimalDenom: "csrm",
        coinDecimals: 6,
      },
      {
        coinDenom: "Cream",
        coinMinimalDenom: "ccream",
        coinDecimals: 18,
      },
      {
        coinDenom: "SAND",
        coinMinimalDenom: "csand",
        coinDecimals: 18,
      },
      {
        coinDenom: "Sushi",
        coinMinimalDenom: "csushi",
        coinDecimals: 18,
      },
      {
        coinDenom: "Empty Set Dollar",
        coinMinimalDenom: "cesd",
        coinDecimals: 18,
      },
      {
        coinDenom: "Uniswap",
        coinMinimalDenom: "cuni",
        coinDecimals: 18,
      },
      {
        coinDenom: "Aave",
        coinMinimalDenom: "caave",
        coinDecimals: 18,
      },
      {
        coinDenom: "BarnBridge",
        coinMinimalDenom: "cbond",
        coinDecimals: 18,
      },
      {
        coinDenom: "Wrapped Filecoin",
        coinMinimalDenom: "cwfil",
        coinDecimals: 18,
      },
      {
        coinDenom: "The Graph",
        coinMinimalDenom: "cgrt",
        coinDecimals: 18,
      },
      {
        coinDenom: "Tokenlon",
        coinMinimalDenom: "clon",
        coinDecimals: 18,
      },
      {
        coinDenom: "1inch",
        coinMinimalDenom: "c1inch",
        coinDecimals: 18,
      },
      {
        coinDenom: "THORChain ERC20",
        coinMinimalDenom: "crune",
        coinDecimals: 18,
      },
      {
        coinDenom: "Secret ERC20",
        coinMinimalDenom: "cwscrt",
        coinDecimals: 6,
      },
      {
        coinDenom: "IoTeX",
        coinMinimalDenom: "ciotx",
        coinDecimals: 18,
      },
      {
        coinDenom: "Reef Finance",
        coinMinimalDenom: "creef",
        coinDecimals: 18,
      },
      {
        coinDenom: "COCOS BCX",
        coinMinimalDenom: "ccocos",
        coinDecimals: 18,
      },
      {
        coinDenom: "Keep Network",
        coinMinimalDenom: "ckeep",
        coinDecimals: 18,
      },
      {
        coinDenom: "Origin Protocol",
        coinMinimalDenom: "cogn",
        coinDecimals: 18,
      },
      {
        coinDenom: "ODAOfi",
        coinMinimalDenom: "cdaofi",
        coinDecimals: 18,
      },
      {
        coinDenom: "Linear",
        coinMinimalDenom: "clina",
        coinDecimals: 18,
      },
      {
        coinDenom: "12Ships",
        coinMinimalDenom: "ctshp",
        coinDecimals: 18,
      },
      {
        coinDenom: "B.20",
        coinMinimalDenom: "cb20",
        coinDecimals: 18,
      },
      {
        coinDenom: "Akropolis",
        coinMinimalDenom: "cakro",
        coinDecimals: 18,
      },
      {
        coinDenom: "Rio Fuel Token",
        coinMinimalDenom: "crfuel",
        coinDecimals: 18,
      },
      {
        coinDenom: "Rally",
        coinMinimalDenom: "crly",
        coinDecimals: 18,
      },
      {
        coinDenom: "Convergence",
        coinMinimalDenom: "cconv",
        coinDecimals: 18,
      },
      {
        coinDenom: "Render Token",
        coinMinimalDenom: "crndr",
        coinDecimals: 18,
      },
      {
        coinDenom: "PAID Network",
        coinMinimalDenom: "cpaid",
        coinDecimals: 18,
      },
      {
        coinDenom: "Tidal",
        coinMinimalDenom: "ctidal",
        coinDecimals: 18,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "ROWAN",
        coinMinimalDenom: "rowan",
        coinDecimals: 18,
        coinGeckoId: "sifchain",
        coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/sifchain.png",
        gasPriceStep: {
          low: 500000000000,
          average: 1000000000000,
          high: 2000000000000,
        },
      },
    ],
    chainSymbolImageUrl:
      "https://dhj8dql1kzq2v.cloudfront.net/white/sifchain.png",
    features: [],
    hideInUI: true,
  },
  {
    rpc: "https://rpc-certik.keplr.app",
    rest: "https://lcd-certik.keplr.app",
    chainId: "shentu-2.2",
    chainName: "Certik",
    stakeCurrency: {
      coinDenom: "CTK",
      coinMinimalDenom: "uctk",
      coinDecimals: 6,
      coinGeckoId: "certik",
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("certik"),
    currencies: [
      {
        coinDenom: "CTK",
        coinMinimalDenom: "uctk",
        coinDecimals: 6,
        coinGeckoId: "certik",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "CTK",
        coinMinimalDenom: "uctk",
        coinDecimals: 6,
        coinGeckoId: "certik",
      },
    ],
    features: ["ibc-transfer", "ibc-go"],
    hideInUI: true,
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
      coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/iris.png",
    },
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
        coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/iris.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "IRIS",
        coinMinimalDenom: "uiris",
        coinDecimals: 6,
        coinGeckoId: "iris-network",
        coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/iris.png",
        gasPriceStep: {
          low: 0.2,
          average: 0.3,
          high: 0.4,
        },
      },
    ],
    chainSymbolImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/iris.png",
    features: ["ibc-transfer"],
    hideInUI: true,
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
      coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/regen.png",
    },
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
        coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/regen.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "REGEN",
        coinMinimalDenom: "uregen",
        coinDecimals: 6,
        coinGeckoId: "regen",
        coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/regen.png",
      },
    ],
    chainSymbolImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/regen.png",
    features: ["ibc-transfer", "ibc-go"],
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
      coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/juno.png",
    },
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
        coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/juno.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "JUNO",
        coinMinimalDenom: "ujuno",
        coinDecimals: 6,
        coinGeckoId: "juno-network",
        coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/juno.png",
        gasPriceStep: {
          low: 0.001,
          average: 0.0025,
          high: 0.004,
        },
      },
    ],
    features: ["cosmwasm", "ibc-transfer", "ibc-go", "wasmd_0.24+"],
    chainSymbolImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/juno.png",
    txExplorer: {
      name: "Mintscan",
      txUrl: "https://www.mintscan.io/juno/txs/{txHash}",
    },
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
      coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/stargaze.png",
    },
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
        coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/stargaze.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "STARS",
        coinMinimalDenom: "ustars",
        coinDecimals: 6,
        coinGeckoId: "stargaze",
        coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/stargaze.png",
      },
    ],
    features: ["ibc-transfer", "ibc-go"],
    chainSymbolImageUrl:
      "https://dhj8dql1kzq2v.cloudfront.net/white/stargaze.png",
    txExplorer: {
      name: "Mintscan",
      txUrl: "https://www.mintscan.io/stargaze/txs/{txHash}",
    },
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
      coinImageUrl:
        "https://dhj8dql1kzq2v.cloudfront.net/white/persistence.png",
    },
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
        coinImageUrl:
          "https://dhj8dql1kzq2v.cloudfront.net/white/persistence.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "XPRT",
        coinMinimalDenom: "uxprt",
        coinDecimals: 6,
        coinGeckoId: "persistence",
        coinImageUrl:
          "https://dhj8dql1kzq2v.cloudfront.net/white/persistence.png",
        gasPriceStep: {
          low: 0,
          average: 0.025,
          high: 0.04,
        },
      },
    ],
    chainSymbolImageUrl:
      "https://dhj8dql1kzq2v.cloudfront.net/white/persistence.png",
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
      coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/axelar_new.png",
    },
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
        coinImageUrl:
          "https://dhj8dql1kzq2v.cloudfront.net/white/axelar_new.png",
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
    ],
    feeCurrencies: [
      {
        coinDenom: "AXL",
        coinMinimalDenom: "uaxl",
        coinDecimals: 6,
        coinGeckoId: "axelar",
        coinImageUrl:
          "https://dhj8dql1kzq2v.cloudfront.net/white/axelar_new.png",
        gasPriceStep: {
          low: 0.007,
          average: 0.007,
          high: 0.01,
        },
      },
    ],
    features: ["ibc-transfer", "ibc-go"],
    chainSymbolImageUrl:
      "https://dhj8dql1kzq2v.cloudfront.net/white/axelar_new.png",
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
      coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/somm.png",
    },
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
        coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/somm.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "SOMM",
        coinMinimalDenom: "usomm",
        coinDecimals: 6,
        coinGeckoId: "sommelier",
        coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/somm.png",
      },
    ],
    features: ["ibc-transfer", "ibc-go"],
    chainSymbolImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/somm.png",
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
      coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/umee.png",
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("umee"),
    currencies: [
      {
        coinDenom: "UMEE",
        coinMinimalDenom: "uumee",
        coinDecimals: 6,
        coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/umee.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "UMEE",
        coinMinimalDenom: "uumee",
        coinDecimals: 6,
        coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/umee.png",
        gasPriceStep: {
          low: 0,
          average: 0.025,
          high: 0.04,
        },
      },
    ],
    features: ["ibc-transfer", "ibc-go"],
    chainSymbolImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/umee.png",
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
      coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/agoric.png",
    },
    bip44: {
      coinType: 564,
    },
    bech32Config: Bech32Address.defaultBech32Config("agoric"),
    currencies: [
      {
        coinDenom: "BLD",
        coinMinimalDenom: "ubld",
        coinDecimals: 6,
        coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/agoric.png",
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
    chainSymbolImageUrl:
      "https://dhj8dql1kzq2v.cloudfront.net/white/agoric.png",
  },
  {
    rpc: "https://rpc-gravity-bridge.keplr.app",
    rest: "https://lcd-gravity-bridge.keplr.app",
    chainId: "gravity-bridge-3",
    chainName: "Gravity Bridge",
    stakeCurrency: {
      coinDenom: "GRAV",
      coinMinimalDenom: "ugraviton",
      coinDecimals: 6,
      coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/grav.png",
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("gravity"),
    currencies: [
      {
        coinDenom: "GRAV",
        coinMinimalDenom: "ugraviton",
        coinDecimals: 6,
        coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/grav.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "GRAV",
        coinMinimalDenom: "ugraviton",
        coinDecimals: 6,
        coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/grav.png",
      },
    ],
    features: ["ibc-transfer", "ibc-go"],
    chainSymbolImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/grav.png",
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
      coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/sentinel.png",
    },
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
        coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/sentinel.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "DVPN",
        coinMinimalDenom: "udvpn",
        coinDecimals: 6,
        coinGeckoId: "sentinel",
        coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/sentinel.png",
        gasPriceStep: {
          low: 0.1,
          average: 0.25,
          high: 0.4,
        },
      },
    ],
    chainSymbolImageUrl:
      "https://dhj8dql1kzq2v.cloudfront.net/white/sentinel.png",
    features: ["ibc-transfer"],
    hideInUI: true,
  },
  {
    rpc: "https://rpc-impacthub.keplr.app",
    rest: "https://lcd-impacthub.keplr.app",
    chainId: "impacthub-3",
    chainName: "ixo",
    stakeCurrency: {
      coinDenom: "IXO",
      coinMinimalDenom: "uixo",
      coinDecimals: 6,
      coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/ixo.png",
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("ixo"),
    currencies: [
      {
        coinDenom: "IXO",
        coinMinimalDenom: "uixo",
        coinDecimals: 6,
        coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/ixo.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "IXO",
        coinMinimalDenom: "uixo",
        coinDecimals: 6,
        coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/ixo.png",
      },
    ],
    chainSymbolImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/ixo.png",
    features: [],
    hideInUI: true,
  },
  {
    rpc: "https://rpc-emoney.keplr.app",
    rest: "https://lcd-emoney.keplr.app",
    chainId: "emoney-3",
    chainName: "e-Money",
    stakeCurrency: {
      coinDenom: "NGM",
      coinMinimalDenom: "ungm",
      coinDecimals: 6,
      coinGeckoId: "e-money",
      coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/ngm.png",
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("emoney"),
    currencies: [
      {
        coinDenom: "NGM",
        coinMinimalDenom: "ungm",
        coinDecimals: 6,
        coinGeckoId: "e-money",
        coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/ngm.png",
      },
      {
        coinDenom: "EEUR",
        coinMinimalDenom: "eeur",
        coinDecimals: 6,
        coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/ngm.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "NGM",
        coinMinimalDenom: "ungm",
        coinDecimals: 6,
        coinGeckoId: "e-money",
        coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/ngm.png",
        gasPriceStep: {
          low: 1,
          average: 1,
          high: 1,
        },
      },
    ],
    chainSymbolImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/ngm.png",
    features: ["ibc-transfer"],
    hideInUI: true,
  },
  {
    rpc: "https://rpc-microtick.keplr.app",
    rest: "https://lcd-microtick.keplr.app",
    chainId: "microtick-1",
    chainName: "Microtick",
    stakeCurrency: {
      coinDenom: "TICK",
      coinMinimalDenom: "utick",
      coinDecimals: 6,
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("micro"),
    currencies: [
      {
        coinDenom: "TICK",
        coinMinimalDenom: "utick",
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "TICK",
        coinMinimalDenom: "utick",
        coinDecimals: 6,
      },
    ],
    features: ["ibc-transfer"],
    hideInUI: true,
  },
  {
    rpc: "https://rpc.bitcanna.io",
    rest: "https://lcd.bitcanna.io",
    chainId: "bitcanna-1",
    chainName: "BitCanna",
    stakeCurrency: {
      coinDenom: "BCNA",
      coinMinimalDenom: "ubcna",
      coinDecimals: 6,
      coinGeckoId: "bitcanna",
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("bcna"),
    currencies: [
      {
        coinDenom: "BCNA",
        coinMinimalDenom: "ubcna",
        coinDecimals: 6,
        coinGeckoId: "bitcanna",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "BCNA",
        coinMinimalDenom: "ubcna",
        coinDecimals: 6,
        coinGeckoId: "bitcanna",
      },
    ],
    features: ["ibc-transfer"],
    hideInUI: true,
  },
  {
    rpc: "https://rpc.explorebitsong.com",
    rest: "https://lcd.explorebitsong.com",
    chainId: "bitsong-2b",
    chainName: "BitSong",
    stakeCurrency: {
      coinDenom: "BTSG",
      coinMinimalDenom: "ubtsg",
      coinDecimals: 6,
    },
    bip44: {
      coinType: 639,
    },
    bech32Config: Bech32Address.defaultBech32Config("bitsong"),
    currencies: [
      {
        coinDenom: "BTSG",
        coinMinimalDenom: "ubtsg",
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "BTSG",
        coinMinimalDenom: "ubtsg",
        coinDecimals: 6,
      },
    ],
    features: ["ibc-transfer"],
    hideInUI: true,
  },
  {
    rpc: "https://rpc-mainnet.blockchain.ki",
    rest: "https://api-mainnet.blockchain.ki",
    chainId: "kichain-2",
    chainName: "Ki",
    stakeCurrency: {
      coinDenom: "XKI",
      coinMinimalDenom: "uxki",
      coinDecimals: 6,
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("ki"),
    currencies: [
      {
        coinDenom: "XKI",
        coinMinimalDenom: "uxki",
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "XKI",
        coinMinimalDenom: "uxki",
        coinDecimals: 6,
      },
    ],
    features: ["ibc-transfer"],
    hideInUI: true,
  },
  {
    rpc: "https://rpc.gopanacea.org",
    rest: "https://api.gopanacea.org",
    chainId: "panacea-3",
    chainName: "Panacea",
    stakeCurrency: {
      coinDenom: "MED",
      coinMinimalDenom: "umed",
      coinDecimals: 6,
      coinGeckoId: "medibloc",
    },
    bip44: {
      coinType: 371,
    },
    bech32Config: Bech32Address.defaultBech32Config("panacea"),
    currencies: [
      {
        coinDenom: "MED",
        coinMinimalDenom: "umed",
        coinDecimals: 6,
        coinGeckoId: "medibloc",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "MED",
        coinMinimalDenom: "umed",
        coinDecimals: 6,
        coinGeckoId: "medibloc",
        gasPriceStep: {
          low: 5,
          average: 7,
          high: 9,
        },
      },
    ],
    features: ["ibc-transfer"],
    hideInUI: true,
  },
  {
    rpc: "https://rpc.bostrom.cybernode.ai",
    rest: "https://lcd.bostrom.cybernode.ai",
    chainId: "bostrom",
    chainName: "Bostrom",
    stakeCurrency: {
      coinDenom: "BOOT",
      coinMinimalDenom: "boot",
      coinDecimals: 0,
    },
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
    ],
    feeCurrencies: [
      {
        coinDenom: "BOOT",
        coinMinimalDenom: "boot",
        coinDecimals: 0,
      },
    ],
    features: ["ibc-transfer", "ibc-go"],
    hideInUI: true,
  },
  {
    rpc: "https://rpc.comdex.one",
    rest: "https://rest.comdex.one",
    chainId: "comdex-1",
    chainName: "Comdex",
    stakeCurrency: {
      coinDenom: "CMDX",
      coinMinimalDenom: "ucmdx",
      coinDecimals: 6,
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("comdex"),
    currencies: [
      {
        coinDenom: "CMDX",
        coinMinimalDenom: "ucmdx",
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "CMDX",
        coinMinimalDenom: "ucmdx",
        coinDecimals: 6,
      },
    ],
    features: ["ibc-transfer", "ibc-go"],
    hideInUI: true,
  },
  {
    rpc: "https://rpc.cheqd.net",
    rest: "https://api.cheqd.net",
    chainId: "cheqd-mainnet-1",
    chainName: "cheqd",
    stakeCurrency: {
      coinDenom: "CHEQ",
      coinMinimalDenom: "ncheq",
      coinDecimals: 9,
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("cheqd"),
    currencies: [
      {
        coinDenom: "CHEQ",
        coinMinimalDenom: "ncheq",
        coinDecimals: 9,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "CHEQ",
        coinMinimalDenom: "ncheq",
        coinDecimals: 9,
        gasPriceStep: {
          low: 25,
          average: 30,
          high: 50,
        },
      },
    ],
    features: ["ibc-transfer", "ibc-go"],
    hideInUI: true,
  },
  {
    rpc: "https://rpc.chihuahua.wtf",
    rest: "https://api.chihuahua.wtf",
    chainId: "chihuahua-1",
    chainName: "Chihuahua",
    stakeCurrency: {
      coinDenom: "HUAHUA",
      coinMinimalDenom: "uhuahua",
      coinDecimals: 6,
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("chihuahua"),
    currencies: [
      {
        coinDenom: "HUAHUA",
        coinMinimalDenom: "uhuahua",
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "HUAHUA",
        coinMinimalDenom: "uhuahua",
        coinDecimals: 6,
        gasPriceStep: {
          low: 0.025,
          average: 0.03,
          high: 0.035,
        },
      },
    ],
    features: ["ibc-transfer", "ibc-go"],
    hideInUI: true,
  },
  {
    rpc: "https://node0.mainnet.lum.network/rpc",
    rest: "https://node0.mainnet.lum.network/rest",
    chainId: "lum-network-1",
    chainName: "Lum Network",
    stakeCurrency: {
      coinDenom: "LUM",
      coinMinimalDenom: "ulum",
      coinDecimals: 6,
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("lum"),
    currencies: [
      {
        coinDenom: "LUM",
        coinMinimalDenom: "ulum",
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "LUM",
        coinMinimalDenom: "ulum",
        coinDecimals: 6,
      },
    ],
    features: ["ibc-transfer", "ibc-go"],
    hideInUI: true,
  },
  {
    rpc: "https://mainnet-rpc.vidulum.app",
    rest: "https://mainnet-lcd.vidulum.app",
    chainId: "vidulum-1",
    chainName: "Vidulum",
    stakeCurrency: {
      coinDenom: "VDL",
      coinMinimalDenom: "uvdl",
      coinDecimals: 6,
      coinGeckoId: "vidulum",
    },
    bip44: {
      coinType: 370,
    },
    bech32Config: Bech32Address.defaultBech32Config("vdl"),
    currencies: [
      {
        coinDenom: "VDL",
        coinMinimalDenom: "uvdl",
        coinDecimals: 6,
        coinGeckoId: "vidulum",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "VDL",
        coinMinimalDenom: "uvdl",
        coinDecimals: 6,
        coinGeckoId: "vidulum",
      },
    ],
    features: ["ibc-transfer", "ibc-go"],
    hideInUI: true,
  },
  {
    rpc: "https://rpc.mainnet.desmos.network",
    rest: "https://api.mainnet.desmos.network",
    chainId: "desmos-mainnet",
    chainName: "Desmos",
    stakeCurrency: {
      coinDenom: "DSM",
      coinMinimalDenom: "udsm",
      coinDecimals: 6,
      coinGeckoId: "desmos",
    },
    bip44: {
      coinType: 852,
    },
    bech32Config: Bech32Address.defaultBech32Config("desmos"),
    currencies: [
      {
        coinDenom: "DSM",
        coinMinimalDenom: "udsm",
        coinDecimals: 6,
        coinGeckoId: "desmos",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "DSM",
        coinMinimalDenom: "udsm",
        coinDecimals: 6,
        coinGeckoId: "desmos",
      },
    ],
    features: ["ibc-transfer", "ibc-go"],
    hideInUI: true,
  },
  {
    rpc: "https://rpc-1-dig.notional.ventures",
    rest: "https://api-1-dig.notional.ventures",
    chainId: "dig-1",
    chainName: "Dig",
    stakeCurrency: {
      coinDenom: "DIG",
      coinMinimalDenom: "udig",
      coinDecimals: 6,
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("dig"),
    currencies: [
      {
        coinDenom: "DIG",
        coinMinimalDenom: "udig",
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "DIG",
        coinMinimalDenom: "udig",
        coinDecimals: 6,
        gasPriceStep: {
          low: 0.025,
          average: 0.03,
          high: 0.035,
        },
      },
    ],
    features: ["ibc-transfer", "ibc-go"],
    hideInUI: true,
  },
  {
    rpc: "https://rpc-evmos.keplr.app",
    rest: "https://lcd-evmos.keplr.app",
    chainId: "evmos_9001-2",
    chainName: "Evmos",
    stakeCurrency: {
      coinDenom: "EVMOS",
      coinMinimalDenom: "aevmos",
      coinDecimals: 18,
      coinGeckoId: "evmos",
      coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/evmos.png",
    },
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
        coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/evmos.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "EVMOS",
        coinMinimalDenom: "aevmos",
        coinDecimals: 18,
        coinGeckoId: "evmos",
        coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/evmos.png",
        gasPriceStep: {
          low: 25000000000,
          average: 25000000000,
          high: 40000000000,
        },
      },
    ],
    chainSymbolImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/evmos.png",
    features: ["ibc-transfer", "ibc-go", "eth-address-gen", "eth-key-sign"],
    txExplorer: {
      name: "Mintscan",
      txUrl: "https://www.mintscan.io/evmos/txs/{txHash}",
    },
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
      coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/crypto-org.png",
    },
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
        coinImageUrl:
          "https://dhj8dql1kzq2v.cloudfront.net/white/crypto-org.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "CRO",
        coinMinimalDenom: "basecro",
        coinDecimals: 8,
        coinGeckoId: "crypto-com-chain",
        coinImageUrl:
          "https://dhj8dql1kzq2v.cloudfront.net/white/crypto-org.png",
        gasPriceStep: {
          low: 0.025,
          average: 0.03,
          high: 0.04,
        },
      },
    ],
    chainSymbolImageUrl:
      "https://dhj8dql1kzq2v.cloudfront.net/white/crypto-org.png",
    features: ["ibc-transfer"],
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
      coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/stride.png",
    },
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
        coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/stride.png",
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
        coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/stride.png",
        gasPriceStep: {
          low: 0,
          average: 0,
          high: 0.04,
        },
      },
    ],
    chainSymbolImageUrl:
      "https://dhj8dql1kzq2v.cloudfront.net/white/stride.png",
    features: ["ibc-transfer", "ibc-go"],
    txExplorer: {
      name: "Mintscan",
      txUrl: "https://www.mintscan.io/stride/txs/{txHash}",
    },
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
    features: ["ibc-transfer", "ibc-go", "eth-address-gen", "eth-key-sign"],
    chainSymbolImageUrl:
      "https://dhj8dql1kzq2v.cloudfront.net/white/injective.png",
    txExplorer: {
      name: "Mintscan",
      txUrl: "https://www.mintscan.io/injective/txs/{txHash}",
    },
  },
  {
    rpc: "https://rpc-mars.keplr.app",
    rest: "https://lcd-mars.keplr.app",
    chainId: "mars-1",
    chainName: "Mars Hub",
    stakeCurrency: {
      coinDenom: "MARS",
      coinMinimalDenom: "umars",
      coinDecimals: 6,
      coinImageUrl:
        "https://asset-icons.s3.us-west-2.amazonaws.com/white/mars.png",
    },
    bip44: {
      coinType: 118,
    },
    alternativeBIP44s: [
      {
        coinType: 330,
      },
    ],
    bech32Config: Bech32Address.defaultBech32Config("mars"),
    currencies: [
      {
        coinDenom: "MARS",
        coinMinimalDenom: "umars",
        coinDecimals: 6,
        coinImageUrl:
          "https://asset-icons.s3.us-west-2.amazonaws.com/white/mars.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "MARS",
        coinMinimalDenom: "umars",
        coinDecimals: 6,
        gasPriceStep: {
          low: 0,
          average: 0,
          high: 0.01,
        },
        coinImageUrl:
          "https://asset-icons.s3.us-west-2.amazonaws.com/white/mars.png",
      },
    ],
    features: [],
    chainSymbolImageUrl:
      "https://asset-icons.s3.us-west-2.amazonaws.com/white/mars.png",
    txExplorer: {
      name: "Mintscan",
      txUrl: "https://www.mintscan.io/mars-protocol/txs/{txHash}",
    },
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
      coinImageUrl:
        "https://asset-icons.s3.us-west-2.amazonaws.com/white/luna.png",
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
        coinImageUrl:
          "https://asset-icons.s3.us-west-2.amazonaws.com/white/luna.png",
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
        coinImageUrl:
          "https://asset-icons.s3.us-west-2.amazonaws.com/white/luna.png",
      },
    ],
    features: [],
    chainSymbolImageUrl:
      "https://asset-icons.s3.us-west-2.amazonaws.com/white/phoenix.png",
    txExplorer: {
      name: "Terrascope",
      txUrl: "https://terrasco.pe/mainnet/tx/{txHash}",
    },
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
      coinImageUrl:
        "https://asset-icons.s3.us-west-2.amazonaws.com/white/lunc.png",
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
        coinImageUrl:
          "https://asset-icons.s3.us-west-2.amazonaws.com/white/lunc.png",
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
        coinImageUrl:
          "https://asset-icons.s3.us-west-2.amazonaws.com/white/lunc.png",
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
    chainSymbolImageUrl:
      "https://asset-icons.s3.us-west-2.amazonaws.com/white/columbus.png",
  },
  {
    rpc: "https://rpc-quasar.keplr.app",
    rest: "https://lcd-quasar.keplr.app",
    chainId: "quasar-1",
    chainName: "Quasar",
    stakeCurrency: {
      coinDenom: "QSR",
      coinMinimalDenom: "uqsr",
      coinDecimals: 6,
      coinImageUrl:
        "https://asset-icons.s3.us-west-2.amazonaws.com/white/quasar.png",
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "quasar",
      bech32PrefixAccPub: "quasarpub",
      bech32PrefixValAddr: "quasarvaloper",
      bech32PrefixValPub: "quasarvaloperpub",
      bech32PrefixConsAddr: "quasarvalcons",
      bech32PrefixConsPub: "quasarvalconspub",
    },
    currencies: [
      {
        coinDenom: "QSR",
        coinMinimalDenom: "uqsr",
        coinDecimals: 6,
        coinImageUrl:
          "https://asset-icons.s3.us-west-2.amazonaws.com/white/quasar.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "QSR",
        coinMinimalDenom: "uqsr",
        coinDecimals: 6,
        coinImageUrl:
          "https://asset-icons.s3.us-west-2.amazonaws.com/white/quasar.png",
      },
    ],
    features: [],
    chainSymbolImageUrl:
      "https://asset-icons.s3.us-west-2.amazonaws.com/white/quasar.png",
  },
  {
    rpc: "https://rpc-quicksilver.keplr.app",
    rest: "https://lcd-quicksilver.keplr.app",
    chainId: "quicksilver-2",
    chainName: "Quicksilver",
    stakeCurrency: {
      coinDenom: "QCK",
      coinMinimalDenom: "uqck",
      coinDecimals: 6,
      coinGeckoId: "quicksilver",
      coinImageUrl:
        "https://asset-icons.s3.us-west-2.amazonaws.com/white/quicksilver.png",
    },
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
        coinGeckoId: "quicksilver",
        coinImageUrl:
          "https://asset-icons.s3.us-west-2.amazonaws.com/white/quicksilver.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "QCK",
        coinMinimalDenom: "uqck",
        coinDecimals: 6,
        coinGeckoId: "quicksilver",
        coinImageUrl:
          "https://asset-icons.s3.us-west-2.amazonaws.com/white/quicksilver.png",
        gasPriceStep: {
          low: 0.0001,
          average: 0.0001,
          high: 0.00025,
        },
      },
    ],
    features: [],
    chainSymbolImageUrl:
      "https://asset-icons.s3.us-west-2.amazonaws.com/white/quicksilver.png",
    txExplorer: {
      name: "Mintscan",
      txUrl: "https://www.mintscan.io/quicksilver/txs/{txHash}",
    },
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
      coinImageUrl:
        "https://asset-icons.s3.us-west-2.amazonaws.com/white/omniflixhub.png",
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
        coinImageUrl:
          "https://asset-icons.s3.us-west-2.amazonaws.com/white/omniflixhub.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "FLIX",
        coinMinimalDenom: "uflix",
        coinDecimals: 6,
        coinImageUrl:
          "https://asset-icons.s3.us-west-2.amazonaws.com/white/omniflixhub.png",
        gasPriceStep: {
          low: 0.001,
          average: 0.0025,
          high: 0.025,
        },
      },
    ],
    features: [],
    chainSymbolImageUrl:
      "https://asset-icons.s3.us-west-2.amazonaws.com/white/omniflixhub.png",
    txExplorer: {
      name: "Mintscan",
      txUrl: "https://www.mintscan.io/omniflix/txs/{txHash}",
    },
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
      coinImageUrl:
        "https://asset-icons.s3.us-west-2.amazonaws.com/white/kyve.png",
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
        coinImageUrl:
          "https://asset-icons.s3.us-west-2.amazonaws.com/white/kyve.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "KYVE",
        coinMinimalDenom: "ukyve",
        coinDecimals: 6,
        coinImageUrl:
          "https://asset-icons.s3.us-west-2.amazonaws.com/white/kyve.png",
        gasPriceStep: {
          low: 0.02,
          average: 0.03,
          high: 0.06,
        },
      },
    ],
    features: [],
    chainSymbolImageUrl:
      "https://asset-icons.s3.us-west-2.amazonaws.com/white/kyve.png",
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
        coinImageUrl:
          "https://asset-icons.s3.us-west-2.amazonaws.com/white/neutron.png",
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
        coinImageUrl:
          "https://asset-icons.s3.us-west-2.amazonaws.com/white/neutron.png",
        gasPriceStep: {
          low: 0.01,
          average: 0.01,
          high: 0.01,
        },
      },
    ],
    features: ["cosmwasm"],
    chainSymbolImageUrl:
      "https://asset-icons.s3.us-west-2.amazonaws.com/white/neutron.png",
  },
  {
    rpc: "https://rpc-gitopia.keplr.app",
    rest: "https://lcd-gitopia.keplr.app",
    chainId: "gitopia",
    chainName: "Gitopia",
    stakeCurrency: {
      coinDenom: "LORE",
      coinMinimalDenom: "ulore",
      coinDecimals: 6,
      coinImageUrl:
        "https://asset-icons.s3.us-west-2.amazonaws.com/white/gitopia.png",
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "gitopia",
      bech32PrefixAccPub: "gitopiapub",
      bech32PrefixValAddr: "gitopiavaloper",
      bech32PrefixValPub: "gitopiavaloperpub",
      bech32PrefixConsAddr: "gitopiavalcons",
      bech32PrefixConsPub: "gitopiavalconspub",
    },
    currencies: [
      {
        coinDenom: "LORE",
        coinMinimalDenom: "ulore",
        coinDecimals: 6,
        coinImageUrl:
          "https://asset-icons.s3.us-west-2.amazonaws.com/white/gitopia.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "LORE",
        coinMinimalDenom: "ulore",
        coinDecimals: 6,
        coinImageUrl:
          "https://asset-icons.s3.us-west-2.amazonaws.com/white/gitopia.png",
        gasPriceStep: {
          low: 0.0012,
          average: 0.0016,
          high: 0.0024,
        },
      },
    ],
    features: [],
    chainSymbolImageUrl:
      "https://asset-icons.s3.us-west-2.amazonaws.com/white/gitopia.png",
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
      coinImageUrl:
        "https://asset-icons.s3.us-west-2.amazonaws.com/white/likecoin.png",
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
        coinImageUrl:
          "https://asset-icons.s3.us-west-2.amazonaws.com/white/likecoin.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "LIKE",
        coinMinimalDenom: "nanolike",
        coinDecimals: 9,
        coinGeckoId: "likecoin",
        coinImageUrl:
          "https://asset-icons.s3.us-west-2.amazonaws.com/white/likecoin.png",
        gasPriceStep: {
          low: 1,
          average: 2,
          high: 3,
        },
      },
    ],
    features: [],
    chainSymbolImageUrl:
      "https://asset-icons.s3.us-west-2.amazonaws.com/white/likecoin.png",
    txExplorer: {
      name: "Mintscan",
      txUrl: "https://www.mintscan.io/likecoin/txs/{txHash}",
    },
  },
];

export const LegacyAmplitudeApiKey =
  process.env["KEPLR_EXT_LEGACY_AMPLITUDE_API_KEY"] || "";
export const AmplitudeApiKey = process.env["KEPLR_EXT_AMPLITUDE_API_KEY"] || "";

export const ICNSInfo = {
  chainId: "osmosis-1",
  resolverContractAddress:
    "osmo1xk0s8xgktn9x5vwcgtjdxqzadg88fgn33p8u9cnpdxwemvxscvast52cdd",
};

export const CommunityChainInfoRepo = {
  organizationName: "chainapsis",
  repoName: "keplr-chain-registry",
  branchName: "main",
};
