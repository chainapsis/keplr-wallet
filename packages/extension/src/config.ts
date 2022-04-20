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
    features: ["stargate", "ibc-transfer", "no-legacy-stdTx", "ibc-go"],
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
      },
    ],
    coinType: 118,
    gasPriceStep: {
      low: 0,
      average: 0,
      high: 0.025,
    },
    features: ["stargate", "ibc-transfer", "no-legacy-stdTx", "ibc-go"],
  },
  {
    rpc: "https://rpc-juno.keplr.app",
    rpcConfig: void 0,
    rest: "https://lcd-juno.keplr.app",
    restConfig: void 0,
    chainId: "juno-1",
    chainName: "Juno",
    stakeCurrency: {
      coinDenom: "JUNO",
      coinMinimalDenom: "ujuno",
      coinDecimals: 6,
      coinGeckoId: "juno-network",
    },
    walletUrl: "https://wallet.keplr.app/#/juno/stake",
    walletUrlForStaking: "https://wallet.keplr.app/#/juno/stake",
    bip44: { coinType: 118 },
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
      },
    ],
    gasPriceStep: { low: 0.001, average: 0.0025, high: 0.004 },
    features: [
      "stargate",
      "no-legacy-stdTx",
      "cosmwasm",
      "ibc-transfer",
      "ibc-go",
    ],
  },
  {
    rpc: "https://rpc-sifchain.keplr.app",
    rpcConfig: void 0,
    rest: "https://lcd-sifchain.keplr.app",
    restConfig: void 0,
    chainId: "sifchain-1",
    chainName: "Sifchain",
    stakeCurrency: {
      coinDenom: "ROWAN",
      coinMinimalDenom: "rowan",
      coinDecimals: 18,
      coinGeckoId: "sifchain",
    },
    walletUrl: "https://wallet.keplr.app/#/sifchain/stake",
    walletUrlForStaking: "https://wallet.keplr.app/#/sifchain/stake",
    bip44: { coinType: 118 },
    bech32Config: Bech32Address.defaultBech32Config("sif"),
    currencies: [
      {
        coinDenom: "ROWAN",
        coinMinimalDenom: "rowan",
        coinDecimals: 18,
        coinGeckoId: "sifchain",
      },
      { coinDenom: "Tether USDT", coinMinimalDenom: "cusdt", coinDecimals: 6 },
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
      { coinDenom: "Chainlink", coinMinimalDenom: "clink", coinDecimals: 18 },
      {
        coinDenom: "Decentraland",
        coinMinimalDenom: "cmana",
        coinDecimals: 18,
      },
      { coinDenom: "Loopring", coinMinimalDenom: "clrc", coinDecimals: 18 },
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
      { coinDenom: "sUSD", coinMinimalDenom: "csusd", coinDecimals: 18 },
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
      { coinDenom: "Swipe", coinMinimalDenom: "csxp", coinDecimals: 18 },
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
      { coinDenom: "UMA", coinMinimalDenom: "cuma", coinDecimals: 18 },
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
      { coinDenom: "Cream", coinMinimalDenom: "ccream", coinDecimals: 18 },
      {
        coinDenom: "SAND",
        coinMinimalDenom: "csand",
        coinDecimals: 18,
      },
      { coinDenom: "Sushi", coinMinimalDenom: "csushi", coinDecimals: 18 },
      {
        coinDenom: "Empty Set Dollar",
        coinMinimalDenom: "cesd",
        coinDecimals: 18,
      },
      { coinDenom: "Uniswap", coinMinimalDenom: "cuni", coinDecimals: 18 },
      {
        coinDenom: "Aave",
        coinMinimalDenom: "caave",
        coinDecimals: 18,
      },
      { coinDenom: "BarnBridge", coinMinimalDenom: "cbond", coinDecimals: 18 },
      {
        coinDenom: "Wrapped Filecoin",
        coinMinimalDenom: "cwfil",
        coinDecimals: 18,
      },
      { coinDenom: "The Graph", coinMinimalDenom: "cgrt", coinDecimals: 18 },
      {
        coinDenom: "Tokenlon",
        coinMinimalDenom: "clon",
        coinDecimals: 18,
      },
      { coinDenom: "1inch", coinMinimalDenom: "c1inch", coinDecimals: 18 },
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
      { coinDenom: "ODAOfi", coinMinimalDenom: "cdaofi", coinDecimals: 18 },
      {
        coinDenom: "Linear",
        coinMinimalDenom: "clina",
        coinDecimals: 18,
      },
      { coinDenom: "12Ships", coinMinimalDenom: "ctshp", coinDecimals: 18 },
      {
        coinDenom: "B.20",
        coinMinimalDenom: "cb20",
        coinDecimals: 18,
      },
      { coinDenom: "Akropolis", coinMinimalDenom: "cakro", coinDecimals: 18 },
      {
        coinDenom: "Rio Fuel Token",
        coinMinimalDenom: "crfuel",
        coinDecimals: 18,
      },
      { coinDenom: "Rally", coinMinimalDenom: "crly", coinDecimals: 18 },
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
      { coinDenom: "Tidal", coinMinimalDenom: "ctidal", coinDecimals: 18 },
      {
        coinDenom: "Axie Infinity",
        coinMinimalDenom: "caxs",
        coinDecimals: 18,
      },
      { coinDenom: "BitSong", coinMinimalDenom: "cbtsg", coinDecimals: 18 },
      {
        coinDenom: "Cosmostarter",
        coinMinimalDenom: "ccsms",
        coinDecimals: 18,
      },
      {
        coinDenom: "Dfyn Network",
        coinMinimalDenom: "cdfyn",
        coinDecimals: 18,
      },
      {
        coinDenom: "DinoSwap",
        coinMinimalDenom: "cdino",
        coinDecimals: 18,
      },
      { coinDenom: "DinoX", coinMinimalDenom: "cdnxc", coinDecimals: 18 },
      {
        coinDenom: "Don-key",
        coinMinimalDenom: "cdon",
        coinDecimals: 18,
      },
      {
        coinDenom: "Ethernity Chain",
        coinMinimalDenom: "cern",
        coinDecimals: 18,
      },
      {
        coinDenom: "Frax",
        coinMinimalDenom: "cfrax",
        coinDecimals: 18,
      },
      { coinDenom: "Frax Share", coinMinimalDenom: "cfxs", coinDecimals: 18 },
      {
        coinDenom: "Knit Finance",
        coinMinimalDenom: "ckft",
        coinDecimals: 18,
      },
      { coinDenom: "Lido DAO", coinMinimalDenom: "cldo", coinDecimals: 18 },
      {
        coinDenom: "Doge Killer",
        coinMinimalDenom: "cleash",
        coinDecimals: 18,
      },
      {
        coinDenom: "LGCY Network",
        coinMinimalDenom: "clgcy",
        coinDecimals: 18,
      },
      {
        coinDenom: "Polygon",
        coinMinimalDenom: "cmatic",
        coinDecimals: 18,
      },
      {
        coinDenom: "Metis Token",
        coinMinimalDenom: "cmetis",
        coinDecimals: 18,
      },
      {
        coinDenom: "Oh! Finance",
        coinMinimalDenom: "coh",
        coinDecimals: 18,
      },
      {
        coinDenom: "Polkastarter",
        coinMinimalDenom: "cpols",
        coinDecimals: 18,
      },
      {
        coinDenom: "Marlin",
        coinMinimalDenom: "cpond",
        coinDecimals: 18,
      },
      { coinDenom: "Quickswap", coinMinimalDenom: "cquick", coinDecimals: 18 },
      {
        coinDenom: "Railgun",
        coinMinimalDenom: "crail",
        coinDecimals: 18,
      },
      {
        coinDenom: "StaFi rATOM",
        coinMinimalDenom: "cratom",
        coinDecimals: 18,
      },
      {
        coinDenom: "Saito",
        coinMinimalDenom: "csaito",
        coinDecimals: 18,
      },
      { coinDenom: "Shiba Inu", coinMinimalDenom: "cshib", coinDecimals: 18 },
      {
        coinDenom: "Tokemak",
        coinMinimalDenom: "ctoke",
        coinDecimals: 18,
      },
      { coinDenom: "UFO Gaming", coinMinimalDenom: "cufo", coinDecimals: 18 },
      {
        coinDenom: "UST (ERC-20)",
        coinMinimalDenom: "cust",
        coinDecimals: 18,
      },
      { coinDenom: "0chain", coinMinimalDenom: "czcn", coinDecimals: 18 },
      {
        coinDenom: "Unizen",
        coinMinimalDenom: "czcx",
        coinDecimals: 18,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "ROWAN",
        coinMinimalDenom: "rowan",
        coinDecimals: 18,
        coinGeckoId: "sifchain",
      },
    ],
    gasPriceStep: { low: 1e12, average: 15e11, high: 2e12 },
    features: ["stargate"],
  },
  {
    rpc: "https://rpc-umee.keplr.app",
    rpcConfig: void 0,
    rest: "https://lcd-umee.keplr.app",
    restConfig: void 0,
    chainId: "umee-1",
    chainName: "Umee",
    stakeCurrency: {
      coinDenom: "UMEE",
      coinMinimalDenom: "uumee",
      coinDecimals: 6,
    },
    walletUrl: "https://wallet.keplr.app/#/umee/stake",
    walletUrlForStaking: "https://wallet.keplr.app/#/umee/stake",
    bip44: { coinType: 118 },
    bech32Config: Bech32Address.defaultBech32Config("umee"),
    currencies: [
      { coinDenom: "UMEE", coinMinimalDenom: "uumee", coinDecimals: 6 },
    ],
    feeCurrencies: [
      { coinDenom: "UMEE", coinMinimalDenom: "uumee", coinDecimals: 6 },
    ],
    features: ["stargate", "ibc-transfer", "no-legacy-stdTx", "ibc-go"],
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
