import { Bech32Address } from "@keplr-wallet/cosmos";
import { ChainInfo } from "@keplr-wallet/types";

export const EmbedChainInfos: ChainInfo[] = [
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
    coinType: 118,
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
    features: ["ibc-transfer", "ibc-go", "cosmwasm", "osmosis-txfees"],
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
          low: 0.0125,
          average: 0.1,
          high: 0.25,
        },
      },
    ],
    coinType: 529,
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
    rpc: "https://rpc-iov.keplr.app",
    rest: "https://lcd-iov.keplr.app",
    chainId: "iov-mainnet-ibc",
    chainName: "Starname",
    stakeCurrency: {
      coinDenom: "IOV",
      coinMinimalDenom: "uiov",
      coinDecimals: 6,
      coinGeckoId: "starname",
    },
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/starname"
        : "http://localhost:8080/chains/starname",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/starname"
        : "http://localhost:8080/chains/starname",
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
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "IOV",
        coinMinimalDenom: "uiov",
        coinDecimals: 6,
        coinGeckoId: "starname",
        gasPriceStep: {
          low: 1,
          average: 2,
          high: 3,
        },
      },
    ],
    features: ["ibc-transfer"],
  },
  {
    rpc: "https://rpc-sifchain.keplr.app",
    rest: "https://lcd-sifchain.keplr.app",
    chainId: "sifchain-1",
    chainName: "Sifchain",
    stakeCurrency: {
      coinDenom: "ROWAN",
      coinMinimalDenom: "rowan",
      coinDecimals: 18,
      coinGeckoId: "sifchain",
    },
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/sifchain"
        : "http://localhost:8080/chains/sifchain",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/sifchain"
        : "http://localhost:8080/chains/sifchain",
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
      {
        coinDenom: "Axie Infinity",
        coinMinimalDenom: "caxs",
        coinDecimals: 18,
      },
      {
        coinDenom: "BitSong",
        coinMinimalDenom: "cbtsg",
        coinDecimals: 18,
      },
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
      {
        coinDenom: "DinoX",
        coinMinimalDenom: "cdnxc",
        coinDecimals: 18,
      },
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
      {
        coinDenom: "Frax Share",
        coinMinimalDenom: "cfxs",
        coinDecimals: 18,
      },
      {
        coinDenom: "Knit Finance",
        coinMinimalDenom: "ckft",
        coinDecimals: 18,
      },
      {
        coinDenom: "Lido DAO",
        coinMinimalDenom: "cldo",
        coinDecimals: 18,
      },
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
      {
        coinDenom: "Quickswap",
        coinMinimalDenom: "cquick",
        coinDecimals: 18,
      },
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
      {
        coinDenom: "Shiba Inu",
        coinMinimalDenom: "cshib",
        coinDecimals: 18,
      },
      {
        coinDenom: "Tokemak",
        coinMinimalDenom: "ctoke",
        coinDecimals: 18,
      },
      {
        coinDenom: "UFO Gaming",
        coinMinimalDenom: "cufo",
        coinDecimals: 18,
      },
      {
        coinDenom: "UST (ERC-20)",
        coinMinimalDenom: "cust",
        coinDecimals: 18,
      },
      {
        coinDenom: "0chain",
        coinMinimalDenom: "czcn",
        coinDecimals: 18,
      },
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
        gasPriceStep: {
          low: 1000000000000,
          average: 1500000000000,
          high: 2000000000000,
        },
      },
    ],
    features: [],
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
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/certik"
        : "http://localhost:8080/chains/certik",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/certik"
        : "http://localhost:8080/chains/certik",
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
    coinType: 459,
    beta: true,
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
    },
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/ixo"
        : "http://localhost:8080/chains/ixo",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/ixo"
        : "http://localhost:8080/chains/ixo",
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("ixo"),
    currencies: [
      {
        coinDenom: "IXO",
        coinMinimalDenom: "uixo",
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "IXO",
        coinMinimalDenom: "uixo",
        coinDecimals: 6,
      },
    ],
    features: ["ibc-transfer"],
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
    },
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/e-money"
        : "http://localhost:8080/chains/e-money",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/e-money"
        : "http://localhost:8080/chains/e-money",
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
      },
      {
        coinDenom: "EEUR",
        coinMinimalDenom: "eeur",
        coinDecimals: 6,
        coinGeckoId: "e-money-eur",
      },
      {
        coinDenom: "EDKK",
        coinMinimalDenom: "edkk",
        coinDecimals: 6,
      },
      {
        coinDenom: "ESEK",
        coinMinimalDenom: "esek",
        coinDecimals: 6,
      },
      {
        coinDenom: "ENOK",
        coinMinimalDenom: "enok",
        coinDecimals: 6,
      },
      {
        coinDenom: "ECHF",
        coinMinimalDenom: "echf",
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "NGM",
        coinMinimalDenom: "ungm",
        coinDecimals: 6,
        coinGeckoId: "e-money",
        gasPriceStep: {
          low: 1,
          average: 1,
          high: 1,
        },
      },
      {
        coinDenom: "EEUR",
        coinMinimalDenom: "eeur",
        coinDecimals: 6,
        coinGeckoId: "e-money-eur",
        gasPriceStep: {
          low: 1,
          average: 1,
          high: 1,
        },
      },
      {
        coinDenom: "ECHF",
        coinMinimalDenom: "echf",
        coinDecimals: 6,
        gasPriceStep: {
          low: 1,
          average: 1,
          high: 1,
        },
      },
      {
        coinDenom: "ESEK",
        coinMinimalDenom: "esek",
        coinDecimals: 6,
        gasPriceStep: {
          low: 1,
          average: 1,
          high: 1,
        },
      },
      {
        coinDenom: "ENOK",
        coinMinimalDenom: "enok",
        coinDecimals: 6,
        gasPriceStep: {
          low: 1,
          average: 1,
          high: 1,
        },
      },
      {
        coinDenom: "EDKK",
        coinMinimalDenom: "edkk",
        coinDecimals: 6,
        gasPriceStep: {
          low: 1,
          average: 1,
          high: 1,
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
    rpc: "https://rpc-gravity-bridge.keplr.app",
    rest: "https://lcd-gravity-bridge.keplr.app",
    chainId: "gravity-bridge-3",
    chainName: "Gravity Bridge",
    stakeCurrency: {
      coinDenom: "GRAV",
      coinMinimalDenom: "ugraviton",
      coinDecimals: 6,
    },
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/gravity-bridge"
        : "http://localhost:8080/chains/gravity-bridge",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/chains/gravity-bridge"
        : "http://localhost:8080/chains/gravity-bridge",
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("gravity"),
    currencies: [
      {
        coinDenom: "GRAV",
        coinMinimalDenom: "ugraviton",
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "GRAV",
        coinMinimalDenom: "ugraviton",
        coinDecimals: 6,
      },
      {
        coinDenom: "USDC",
        coinMinimalDenom: "gravity0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        coinDecimals: 6,
      },
      {
        coinDenom: "USDT",
        coinMinimalDenom: "gravity0xdAC17F958D2ee523a2206206994597C13D831ec7",
        coinDecimals: 6,
      },
      {
        coinDenom: "FUND",
        coinMinimalDenom: "ibc/D157AD8A50DAB0FC4EB95BBE1D9407A590FA2CDEE04C90A76C005089BF76E519",
        coinDecimals: 9,
      },
      {
        coinDenom: "MNTL",
        coinMinimalDenom: "ibc/00F2B62EB069321A454B708876476AFCD9C23C8C9C4A5A206DDF1CD96B645057",
        coinDecimals: 6,
      },
      {
        coinDenom: "CHEQ",
        coinMinimalDenom: "ibc/5012B1C96F286E8A6604A87037CE51241C6F1CA195B71D1E261FCACB69FB6BC2",
        coinDecimals: 9,
      },
      {
        coinDenom: "HUAHUA",
        coinMinimalDenom: "ibc/048BE20AE2E6BFD4142C547E04F17E5F94363003A12B7B6C084E08101BFCF7D1",
        coinDecimals: 6,
      },
      {
        coinDenom: "STARS",
        coinMinimalDenom: "ibc/4F393C3FCA4190C0A6756CE7F6D897D5D1BE57D6CCB80D0BC87393566A7B6602",
        coinDecimals: 6,
      },
      {
        coinDenom: "CMDX",
        coinMinimalDenom: "ibc/29A7122D024B5B8FA8A2EFBB4FA47272C25C8926AA005A96807127208082DAB3",
        coinDecimals: 6,
      },
      {
        coinDenom: "ATOM",
        coinMinimalDenom: "ibc/2E5D0AC026AC1AFA65A23023BA4F24BB8DDF94F118EDC0BAD6F625BFC557CDED",
        coinDecimals: 6,
      },
      {
        coinDenom: "NYM",
        coinMinimalDenom: "ibc/0C273962C274B2C05B22D9474BFE5B84D6A6FCAD198CB9B0ACD35EA521A36606",
        coinDecimals: 6,
      },
      {
        coinDenom: "GTON",
        coinMinimalDenom: "gravity0x01e0E2e61f554eCAaeC0cC933E739Ad90f24a86d",
        coinDecimals: 18,
      },
      {
        coinDenom: "EROWAN",
        coinMinimalDenom: "gravity0x07baC35846e5eD502aA91AdF6A9e7aA210F2DcbE",
        coinDecimals: 18,
      },
      {
        coinDenom: "GEO",
        coinMinimalDenom: "gravity0x147faF8De9d8D8DAAE129B187F0D02D819126750",
        coinDecimals: 18,
      },
      {
        coinDenom: "UNI",
        coinMinimalDenom: "gravity0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
        coinDecimals: 18,
      },
      {
        coinDenom: "WBTC",
        coinMinimalDenom: "gravity0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
        coinDecimals: 8,
      },
      {
        coinDenom: "WSCRT",
        coinMinimalDenom: "gravity0x2B89bF8ba858cd2FCee1faDa378D5cd6936968Be",
        coinDecimals: 6,
      },
      {
        coinDenom: "stkETH",
        coinMinimalDenom: "gravity0x2C5Bcad9Ade17428874855913Def0A02D8bE2324",
        coinDecimals: 18,
      },
      {
        coinDenom: "SD",
        coinMinimalDenom: "gravity0x30D20208d987713f46DFD34EF128Bb16C404D10f",
        coinDecimals: 18,
      },
      {
        coinDenom: "WDOGE",
        coinMinimalDenom: "gravity0x35a532d376FFd9a705d0Bb319532837337A398E7",
        coinDecimals: 18,
      },
      {
        coinDenom: "PAXG",
        coinMinimalDenom: "gravity0x45804880De22913dAFE09f4980848ECE6EcbAf78",
        coinDecimals: 18,
      },
      {
        coinDenom: "AXL",
        coinMinimalDenom: "gravity0x467719aD09025FcC6cF6F8311755809d45a5E5f3",
        coinDecimals: 6,
      },
      {
        coinDenom: "XKI",
        coinMinimalDenom: "gravity0x4f6103BAd230295baCF30f914FDa7D4273B7F585",
        coinDecimals: 6,
      },
      {
        coinDenom: "LINK",
        coinMinimalDenom: "gravity0x514910771AF9Ca656af840dff83E8264EcF986CA",
        coinDecimals: 18,
      },
      {
        coinDenom: "PAGE",
        coinMinimalDenom: "gravity0x60e683C6514Edd5F758A55b6f393BeBBAfaA8d5e",
        coinDecimals: 8,
      },
      {
        coinDenom: "DAI",
        coinMinimalDenom: "gravity0x6B175474E89094C44Da98b954EedeAC495271d0F",
        coinDecimals: 18,
      },
      {
        coinDenom: "MATIC",
        coinMinimalDenom: "gravity0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
        coinDecimals: 18,
      },
      {
        coinDenom: "CUDOS",
        coinMinimalDenom: "gravity0x817bbDbC3e8A1204f3691d14bB44992841e3dB35",
        coinDecimals: 18,
      },
      {
        coinDenom: "FRAX",
        coinMinimalDenom: "gravity0x853d955aCEf822Db058eb8505911ED77F175b99e",
        coinDecimals: 18,
      },
      {
        coinDenom: "xFUND",
        coinMinimalDenom: "gravity0x892A6f9dF0147e5f079b0993F486F9acA3c87881",
        coinDecimals: 9,
      },
      {
        coinDenom: "ATOM",
        coinMinimalDenom: "gravity0x8D983cb9388EaC77af0474fA441C4815500Cb7BB",
        coinDecimals: 6,
      },
      {
        coinDenom: "GET",
        coinMinimalDenom: "gravity0x8a854288a5976036A725879164Ca3e91d30c6A1B",
        coinDecimals: 18,
      },
      {
        coinDenom: "WEVMOS",
        coinMinimalDenom: "gravity0x93581991f68DBaE1eA105233b67f7FA0D6BDeE7b",
        coinDecimals: 18,
      },
      {
        coinDenom: "SHIB",
        coinMinimalDenom: "gravity0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
        coinDecimals: 18,
      },
      {
        coinDenom: "CRO",
        coinMinimalDenom: "gravity0xA0b73E1Ff0B80914AB6fe0444E65848C4C34450b",
        coinDecimals: 8,
      },
      {
        coinDenom: "STORJ",
        coinMinimalDenom: "gravity0xB64ef51C888972c908CFacf59B47C1AfBC0Ab8aC",
        coinDecimals: 8,
      },
      {
        coinDenom: "BAND",
        coinMinimalDenom: "gravity0xBA11D00c5f74255f56a5E366F4F77f5A186d7f55",
        coinDecimals: 18,
      },
      {
        coinDenom: "WETH",
        coinMinimalDenom: "gravity0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        coinDecimals: 18,
      },
      {
        coinDenom: "USTC",
        coinMinimalDenom: "gravity0xa47c8bf37f92aBed4A126BDA807A7b7498661acD",
        coinDecimals: 18,
      },
      {
        coinDenom: "somm",
        coinMinimalDenom: "gravity0xa670d7237398238DE01267472C6f13e5B8010FD1",
        coinDecimals: 6,
      },
      {
        coinDenom: "UST",
        coinMinimalDenom: "gravity0xa693B19d2931d498c5B318dF961919BB4aee87a5",
        coinDecimals: 6,
      },
      {
        coinDenom: "stETH",
        coinMinimalDenom: "gravity0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84",
        coinDecimals: 18,
      },
      {
        coinDenom: "FET",
        coinMinimalDenom: "gravity0xaea46A60368A7bD060eec7DF8CBa43b7EF41Ad85",
        coinDecimals: 18,
      },
      {
        coinDenom: "UMEE",
        coinMinimalDenom: "gravity0xc0a4Df35568F116C370E6a6A6022Ceb908eedDaC",
        coinDecimals: 6,
      },
      {
        coinDenom: "ERC20",
        coinMinimalDenom: "gravity0xc3761EB917CD790B30dAD99f6Cc5b4Ff93C4F9eA",
        coinDecimals: 18,
      },
      {
        coinDenom: "GRAV",
        coinMinimalDenom: "gravity0xd8e2F184EedC79A9bdE9Eb7E34B0fF34e98692B7",
        coinDecimals: 18,
      },
      {
        coinDenom: "PSTAKE",
        coinMinimalDenom: "gravity0xfB5c6815cA3AC72Ce9F5006869AE67f18bF77006",
        coinDecimals: 18,
      },
    ],
    features: ["ibc-transfer", "ibc-go"],
  },
  {
    rpc: "https://rpc-tgrade.keplr.app",
    rest: "https://lcd-tgrade.keplr.app",
    chainId: "tgrade-mainnet-1",
    chainName: "Tgrade",
    stakeCurrency: {
      coinDenom: "TGD",
      coinMinimalDenom: "utgd",
      coinDecimals: 6,
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("tgrade"),
    currencies: [
      {
        coinDenom: "TGD",
        coinMinimalDenom: "utgd",
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "TGD",
        coinMinimalDenom: "utgd",
        coinDecimals: 6,
        gasPriceStep: {
          low: 0.05,
          average: 0.05,
          high: 0.075,
        },
      },
    ],
    features: ["cosmwasm", "ibc-transfer", "ibc-go", "wasmd_0.24+"],
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
    beta: true,
  },
];

// The origins that are able to pass any permission that external webpages can have.
export const PrivilegedOrigins: string[] = ["https://wallet.keplr.app"];
