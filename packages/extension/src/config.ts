import { Bech32Address } from "@keplr-wallet/cosmos";
import { ChainInfo } from "@keplr-wallet/types";

import {
  PRIVILEGED_ORIGINS,
  COSMOS_REST_CONFIG,
  COSMOS_REST_ENDPOINT,
  COSMOS_RPC_CONFIG,
  COSMOS_RPC_ENDPOINT,
  OSMOSIS_REST_CONFIG,
  OSMOSIS_REST_ENDPOINT,
  OSMOSIS_RPC_CONFIG,
  OSMOSIS_RPC_ENDPOINT,
  KAVA_REST_CONFIG,
  KAVA_REST_ENDPOINT,
  KAVA_RPC_CONFIG,
  KAVA_RPC_ENDPOINT,
  SECRET_NETWORK_REST_CONFIG,
  SECRET_NETWORK_REST_ENDPOINT,
  SECRET_NETWORK_RPC_CONFIG,
  SECRET_NETWORK_RPC_ENDPOINT,
  BETA_CYBER_NETWORK_REST_ENDPOINT,
  BETA_CYBER_NETWORK_REST_CONFIG,
  BETA_CYBER_NETWORK_RPC_ENDPOINT,
  BETA_CYBER_NETWORK_RPC_CONFIG,
  AKASH_RPC_ENDPOINT,
  AKASH_RPC_CONFIG,
  AKASH_REST_ENDPOINT,
  AKASH_REST_CONFIG,
  CRYPTO_ORG_RPC_ENDPOINT,
  CRYPTO_ORG_RPC_CONFIG,
  CRYPTO_ORG_REST_ENDPOINT,
  CRYPTO_ORG_REST_CONFIG,
  IOV_RPC_ENDPOINT,
  IOV_RPC_CONFIG,
  IOV_REST_ENDPOINT,
  IOV_REST_CONFIG,
  CERTIK_RPC_ENDPOINT,
  CERTIK_RPC_CONFIG,
  CERTIK_REST_ENDPOINT,
  CERTIK_REST_CONFIG,
  SIFCHAIN_RPC_ENDPOINT,
  SIFCHAIN_RPC_CONFIG,
  SIFCHAIN_REST_ENDPOINT,
  SIFCHAIN_REST_CONFIG,
  IRIS_RPC_ENDPOINT,
  IRIS_RPC_CONFIG,
  IRIS_REST_ENDPOINT,
  IRIS_REST_CONFIG,
  REGEN_RPC_ENDPOINT,
  REGEN_RPC_CONFIG,
  REGEN_REST_ENDPOINT,
  REGEN_REST_CONFIG,
  SENTINEL_RPC_ENDPOINT,
  SENTINEL_RPC_CONFIG,
  SENTINEL_REST_ENDPOINT,
  SENTINEL_REST_CONFIG,
  PERSISTENCE_RPC_ENDPOINT,
  PERSISTENCE_RPC_CONFIG,
  PERSISTENCE_REST_ENDPOINT,
  PERSISTENCE_REST_CONFIG,
  IXO_RPC_ENDPOINT,
  IXO_RPC_CONFIG,
  IXO_REST_ENDPOINT,
  IXO_REST_CONFIG,
  EMONEY_RPC_ENDPOINT,
  EMONEY_RPC_CONFIG,
  EMONEY_REST_ENDPOINT,
  EMONEY_REST_CONFIG,
  AGORIC_RPC_ENDPOINT,
  AGORIC_RPC_CONFIG,
  AGORIC_REST_ENDPOINT,
  AGORIC_REST_CONFIG,
  AXELAR_RPC_ENDPOINT,
  AXELAR_RPC_CONFIG,
  AXELAR_REST_ENDPOINT,
  AXELAR_REST_CONFIG,
  JUNO_RPC_ENDPOINT,
  JUNO_RPC_CONFIG,
  JUNO_REST_ENDPOINT,
  JUNO_REST_CONFIG,
  STARGAZE_RPC_ENDPOINT,
  STARGAZE_RPC_CONFIG,
  STARGAZE_REST_ENDPOINT,
  STARGAZE_REST_CONFIG,
  SOMMELIER_RPC_ENDPOINT,
  SOMMELIER_RPC_CONFIG,
  SOMMELIER_REST_ENDPOINT,
  SOMMELIER_REST_CONFIG,
  UMEE_RPC_ENDPOINT,
  UMEE_RPC_CONFIG,
  UMEE_REST_ENDPOINT,
  UMEE_REST_CONFIG,
  GRAVITY_BRIDGE_RPC_ENDPOINT,
  GRAVITY_BRIDGE_RPC_CONFIG,
  GRAVITY_BRIDGE_REST_ENDPOINT,
  GRAVITY_BRIDGE_REST_CONFIG,
  TGRADE_RPC_ENDPOINT,
  TGRADE_RPC_CONFIG,
  TGRADE_REST_ENDPOINT,
  TGRADE_REST_CONFIG,
  EVMOS_RPC_ENDPOINT,
  EVMOS_RPC_CONFIG,
  EVMOS_REST_ENDPOINT,
  EVMOS_REST_CONFIG,
} from "./config.var";

export const EmbedChainInfos: ChainInfo[] = [
  {
    rpc: COSMOS_RPC_ENDPOINT,
    rpcConfig: COSMOS_RPC_CONFIG,
    rest: COSMOS_REST_ENDPOINT,
    restConfig: COSMOS_REST_CONFIG,
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
    rpc: OSMOSIS_RPC_ENDPOINT,
    rpcConfig: OSMOSIS_RPC_CONFIG,
    rest: OSMOSIS_REST_ENDPOINT,
    restConfig: OSMOSIS_REST_CONFIG,
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
      },
    ],
    gasPriceStep: {
      low: 0,
      average: 0.025,
      high: 0.04,
    },
    features: ["ibc-transfer", "ibc-go", "cosmwasm"],
  },
  {
    rpc: SECRET_NETWORK_RPC_ENDPOINT,
    rpcConfig: SECRET_NETWORK_RPC_CONFIG,
    rest: SECRET_NETWORK_REST_ENDPOINT,
    restConfig: SECRET_NETWORK_REST_CONFIG,
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
      },
    ],
    coinType: 529,
    gasPriceStep: {
      low: 0.0125,
      average: 0.1,
      high: 0.25,
    },
    features: ["secretwasm", "ibc-go", "ibc-transfer"],
  },
  {
    rpc: AKASH_RPC_ENDPOINT,
    rpcConfig: AKASH_RPC_CONFIG,
    rest: AKASH_REST_ENDPOINT,
    restConfig: AKASH_REST_CONFIG,
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
    rpc: CRYPTO_ORG_RPC_ENDPOINT,
    rpcConfig: CRYPTO_ORG_RPC_CONFIG,
    rest: CRYPTO_ORG_REST_ENDPOINT,
    restConfig: CRYPTO_ORG_REST_CONFIG,
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
    bech32Config: Bech32Address.defaultBech32Config("cro"),
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
      },
    ],
    gasPriceStep: {
      low: 0.025,
      average: 0.03,
      high: 0.04,
    },
    features: ["ibc-transfer"],
  },
  {
    rpc: IOV_RPC_ENDPOINT,
    rpcConfig: IOV_RPC_CONFIG,
    rest: IOV_REST_ENDPOINT,
    restConfig: IOV_REST_CONFIG,
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
      },
    ],
    gasPriceStep: {
      low: 1,
      average: 2,
      high: 3,
    },
    features: ["ibc-transfer"],
  },
  {
    rpc: SIFCHAIN_RPC_ENDPOINT,
    rpcConfig: SIFCHAIN_RPC_CONFIG,
    rest: SIFCHAIN_REST_ENDPOINT,
    restConfig: SIFCHAIN_REST_CONFIG,
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
      },
    ],
    gasPriceStep: {
      low: 1000000000000,
      average: 1500000000000,
      high: 2000000000000,
    },
    features: [],
  },
  {
    rpc: CERTIK_RPC_ENDPOINT,
    rpcConfig: CERTIK_RPC_CONFIG,
    rest: CERTIK_REST_ENDPOINT,
    restConfig: CERTIK_REST_CONFIG,
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
    rpc: IRIS_RPC_ENDPOINT,
    rpcConfig: IRIS_RPC_CONFIG,
    rest: IRIS_REST_ENDPOINT,
    restConfig: IRIS_REST_CONFIG,
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
    bech32Config: Bech32Address.defaultBech32Config("iaa"),
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
      },
    ],
    gasPriceStep: {
      low: 0.2,
      average: 0.3,
      high: 0.4,
    },
    features: ["ibc-transfer", "ibc-go"],
  },
  {
    rpc: REGEN_RPC_ENDPOINT,
    rpcConfig: REGEN_RPC_CONFIG,
    rest: REGEN_REST_ENDPOINT,
    restConfig: REGEN_REST_CONFIG,
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
      },
    ],
    gasPriceStep: {
      low: 0.015,
      average: 0.025,
      high: 0.04,
    },
    features: ["ibc-go", "ibc-transfer", "ibc-go"],
  },
  {
    rpc: PERSISTENCE_RPC_ENDPOINT,
    rpcConfig: PERSISTENCE_RPC_CONFIG,
    rest: PERSISTENCE_REST_ENDPOINT,
    restConfig: PERSISTENCE_REST_CONFIG,
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
      coinType: 750,
    },
    bech32Config: Bech32Address.defaultBech32Config("persistence"),
    currencies: [
      {
        coinDenom: "XPRT",
        coinMinimalDenom: "uxprt",
        coinDecimals: 6,
        coinGeckoId: "persistence",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "XPRT",
        coinMinimalDenom: "uxprt",
        coinDecimals: 6,
        coinGeckoId: "persistence",
      },
    ],
    gasPriceStep: {
      low: 0,
      average: 0.025,
      high: 0.04,
    },
    features: ["ibc-transfer", "ibc-go"],
  },
  {
    rpc: SENTINEL_RPC_ENDPOINT,
    rpcConfig: SENTINEL_RPC_CONFIG,
    rest: SENTINEL_REST_ENDPOINT,
    restConfig: SENTINEL_REST_CONFIG,
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
      },
    ],
    gasPriceStep: {
      low: 0.1,
      average: 0.25,
      high: 0.4,
    },
    features: ["ibc-transfer"],
  },
  {
    rpc: KAVA_RPC_ENDPOINT,
    rpcConfig: KAVA_RPC_CONFIG,
    rest: KAVA_REST_ENDPOINT,
    restConfig: KAVA_REST_CONFIG,
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
      },
    ],
    gasPriceStep: {
      low: 0.05,
      average: 0.1,
      high: 0.25,
    },
    coinType: 459,
    beta: true,
  },
  {
    rpc: IXO_RPC_ENDPOINT,
    rpcConfig: IXO_RPC_CONFIG,
    rest: IXO_REST_ENDPOINT,
    restConfig: IXO_REST_CONFIG,
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
    rpc: EMONEY_RPC_ENDPOINT,
    rpcConfig: EMONEY_RPC_CONFIG,
    rest: EMONEY_REST_ENDPOINT,
    restConfig: EMONEY_REST_CONFIG,
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
      },
    ],
    gasPriceStep: {
      low: 1,
      average: 1,
      high: 1,
    },
    features: ["ibc-transfer"],
  },
  {
    rpc: AGORIC_RPC_ENDPOINT,
    rpcConfig: AGORIC_RPC_CONFIG,
    rest: AGORIC_REST_ENDPOINT,
    restConfig: AGORIC_REST_CONFIG,
    chainId: "agoric-3",
    chainName: "Agoric",
    stakeCurrency: {
      coinDenom: "BLD",
      coinMinimalDenom: "ubld",
      coinDecimals: 6,
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
      },
      {
        coinDenom: "IST",
        coinMinimalDenom: "uist",
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "IST",
        coinMinimalDenom: "uist",
        coinDecimals: 6,
      },
    ],
    gasPriceStep: {
      low: 0,
      average: 0,
      high: 0,
    },
    features: ["ibc-go"],
  },
  {
    rpc: BETA_CYBER_NETWORK_RPC_ENDPOINT,
    rpcConfig: BETA_CYBER_NETWORK_RPC_CONFIG,
    rest: BETA_CYBER_NETWORK_REST_ENDPOINT,
    restConfig: BETA_CYBER_NETWORK_REST_CONFIG,
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
      },
    ],
    gasPriceStep: {
      low: 0,
      average: 0,
      high: 0.01,
    },
    features: ["ibc-transfer", "cosmwasm", "ibc-go"],
  },
  {
    rpc: JUNO_RPC_ENDPOINT,
    rpcConfig: JUNO_RPC_CONFIG,
    rest: JUNO_REST_ENDPOINT,
    restConfig: JUNO_REST_CONFIG,
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
      },
    ],
    gasPriceStep: {
      low: 0.001,
      average: 0.0025,
      high: 0.004,
    },
    features: ["cosmwasm", "ibc-transfer", "ibc-go", "wasmd_0.24+"],
  },
  {
    rpc: STARGAZE_RPC_ENDPOINT,
    rpcConfig: STARGAZE_RPC_CONFIG,
    rest: STARGAZE_REST_ENDPOINT,
    restConfig: STARGAZE_REST_CONFIG,
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
    rpc: AXELAR_RPC_ENDPOINT,
    rpcConfig: AXELAR_RPC_CONFIG,
    rest: AXELAR_REST_ENDPOINT,
    restConfig: AXELAR_REST_CONFIG,
    chainId: "axelar-dojo-1",
    chainName: "Axelar",
    stakeCurrency: {
      coinDenom: "AXL",
      coinMinimalDenom: "uaxl",
      coinDecimals: 6,
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
      },
    ],
    gasPriceStep: {
      low: 0.05,
      average: 0.075,
      high: 0.1,
    },
    features: ["ibc-transfer", "ibc-go"],
  },
  {
    rpc: SOMMELIER_RPC_ENDPOINT,
    rpcConfig: SOMMELIER_RPC_CONFIG,
    rest: SOMMELIER_REST_ENDPOINT,
    restConfig: SOMMELIER_REST_CONFIG,
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
    rpc: UMEE_RPC_ENDPOINT,
    rpcConfig: UMEE_RPC_CONFIG,
    rest: UMEE_REST_ENDPOINT,
    restConfig: UMEE_REST_CONFIG,
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
      },
    ],
    features: ["ibc-transfer", "ibc-go"],
  },
  {
    rpc: GRAVITY_BRIDGE_RPC_ENDPOINT,
    rpcConfig: GRAVITY_BRIDGE_RPC_CONFIG,
    rest: GRAVITY_BRIDGE_REST_ENDPOINT,
    restConfig: GRAVITY_BRIDGE_REST_CONFIG,
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
    ],
    features: ["ibc-transfer", "ibc-go"],
  },
  {
    rpc: TGRADE_RPC_ENDPOINT,
    rpcConfig: TGRADE_RPC_CONFIG,
    rest: TGRADE_REST_ENDPOINT,
    restConfig: TGRADE_REST_CONFIG,
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
      },
    ],
    gasPriceStep: {
      low: 0.05,
      average: 0.05,
      high: 0.075,
    },
    features: ["cosmwasm", "ibc-transfer", "ibc-go", "wasmd_0.24+"],
  },
  {
    rpc: EVMOS_RPC_ENDPOINT,
    rpcConfig: EVMOS_RPC_CONFIG,
    rest: EVMOS_REST_ENDPOINT,
    restConfig: EVMOS_REST_CONFIG,
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
      },
    ],
    gasPriceStep: {
      low: 25000000000,
      average: 25000000000,
      high: 40000000000,
    },
    features: ["ibc-transfer", "ibc-go", "eth-address-gen", "eth-key-sign"],
    beta: true,
  },
];

// The origins that are able to pass any permission that external webpages can have.
export const PrivilegedOrigins: string[] = PRIVILEGED_ORIGINS;
