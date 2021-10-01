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
    chainName: "Cosmos",
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
    features: ["stargate", "ibc-transfer"],
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
      },
    ],
    coinType: 118,
    gasPriceStep: {
      low: 0,
      average: 0.025,
      high: 0.04,
    },
    features: ["stargate", "ibc-transfer"],
    chainSymbolImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/osmo.png",
    txExplorer: {
      name: "Mintscan",
      txUrl: "https://www.mintscan.io/osmosis/txs/{txHash}",
    },
  },
  {
    rpc: "https://rpc-secret.keplr.app",
    rest: "https://lcd-secret.keplr.app",
    chainId: "secret-3",
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
      },
    ],
    coinType: 529,
    gasPriceStep: {
      low: 0.1,
      average: 0.25,
      high: 0.3,
    },
    chainSymbolImageUrl:
      "https://dhj8dql1kzq2v.cloudfront.net/white/secret.png",
    features: ["secretwasm"],
    hideInUI: true,
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
    features: ["stargate", "ibc-transfer"],
    hideInUI: true,
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
    bech32Config: Bech32Address.defaultBech32Config("cro"),
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
      },
    ],
    gasPriceStep: {
      low: 0.025,
      average: 0.03,
      high: 0.04,
    },
    chainSymbolImageUrl:
      "https://dhj8dql1kzq2v.cloudfront.net/white/crypto-org.png",
    features: ["stargate", "ibc-transfer"],
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
      },
    ],
    gasPriceStep: {
      low: 1,
      average: 2,
      high: 3,
    },
    chainSymbolImageUrl:
      "https://dhj8dql1kzq2v.cloudfront.net/white/starname.png",
    features: ["stargate", "ibc-transfer"],
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
      },
    ],
    gasPriceStep: {
      low: 500000000000,
      average: 1000000000000,
      high: 2000000000000,
    },
    chainSymbolImageUrl:
      "https://dhj8dql1kzq2v.cloudfront.net/white/sifchain.png",
    features: ["stargate"],
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
    features: ["stargate", "ibc-transfer"],
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
    bech32Config: Bech32Address.defaultBech32Config("iaa"),
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
      },
    ],
    gasPriceStep: {
      low: 0.2,
      average: 0.3,
      high: 0.4,
    },
    chainSymbolImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/iris.png",
    features: ["stargate", "ibc-transfer"],
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
    features: ["stargate", "ibc-transfer"],
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
      coinType: 750,
    },
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
      },
    ],
    gasPriceStep: {
      low: 0,
      average: 0.025,
      high: 0.04,
    },
    chainSymbolImageUrl:
      "https://dhj8dql1kzq2v.cloudfront.net/white/persistence.png",
    features: ["stargate", "ibc-transfer"],
    hideInUI: true,
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
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/sentinel/stake"
        : "http://localhost:8081/#/sentinel/stake",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/sentinel/stake"
        : "http://localhost:8081/#/sentinel/stake",
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
      },
    ],
    gasPriceStep: {
      low: 0.1,
      average: 0.25,
      high: 0.4,
    },
    chainSymbolImageUrl:
      "https://dhj8dql1kzq2v.cloudfront.net/white/sentinel.png",
    features: ["stargate", "ibc-transfer"],
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
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/ixo/stake"
        : "http://localhost:8081/#/ixo/stake",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/ixo/stake"
        : "http://localhost:8081/#/ixo/stake",
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
    features: ["stargate"],
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
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/emoney/stake"
        : "http://localhost:8080/#/emoney/stake",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/emoney/stake"
        : "http://localhost:8080/#/emoney/stake",
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
      },
    ],
    gasPriceStep: {
      low: 1,
      average: 1,
      high: 1,
    },
    chainSymbolImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/ngm.png",
    features: ["stargate", "ibc-transfer"],
    hideInUI: true,
  },
];
