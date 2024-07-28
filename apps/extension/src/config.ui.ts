// Seperate shared config from UI config to prevent code mixup between UI and background process code.
import { FiatCurrency } from "@keplr-wallet/types";

export const HelpDeskUrl = "https://help.keplr.app";
export const TermsOfUseUrl = "https://terms-of-use.keplr.app";

export const CoinGeckoAPIEndPoint =
  process.env["KEPLR_EXT_COINGECKO_ENDPOINT"] ||
  "https://api.coingecko.com/api/v3";
export const CoinGeckoGetPrice =
  process.env["KEPLR_EXT_COINGECKO_GETPRICE"] || "/simple/price";
export const CoinGeckoCoinDataByTokenAddress =
  process.env["KEPLR_EXT_COINGECKO_COIN_DATA_BY_TOKEN_ADDRESS"] ||
  "/coins/{coingeckoChainId}/contract/{contractAddress}";

export const AutoFetchingFiatValueInterval = 300 * 1000; // 5min

export const AutoFetchingAssetsInterval = 15 * 1000; // 15sec

export const DefaultGasMsgWithdrawRewards = 240000; // Gas per messages.

// Endpoint for Ethereum node.
// This is used for ENS.
export const EthereumEndpoint =
  process.env["KEPLR_EXT_ETHEREUM_ENDPOINT"] || "";

export const TokenContractListURL =
  "https://opbaqquqruxn7fdsgcncrtfrwa0qxnoj.lambda-url.us-west-2.on.aws/";
export const TokenContractListRepoURL =
  "https://github.com/chainapsis/keplr-contract-registry";

export const FiatCurrencies: FiatCurrency[] = [
  {
    currency: "usd",
    symbol: "$",
    maxDecimals: 2,
    locale: "en-US",
  },
  {
    currency: "eur",
    symbol: "€",
    maxDecimals: 2,
    locale: "de-DE",
  },
  {
    currency: "gbp",
    symbol: "£",
    maxDecimals: 2,
    locale: "en-GB",
  },
  {
    currency: "cad",
    symbol: "CA$",
    maxDecimals: 2,
    locale: "en-CA",
  },
  {
    currency: "aud",
    symbol: "AU$",
    maxDecimals: 2,
    locale: "en-AU",
  },
  {
    currency: "rub",
    symbol: "₽",
    maxDecimals: 0,
    locale: "ru",
  },
  {
    currency: "krw",
    symbol: "₩",
    maxDecimals: 0,
    locale: "ko-KR",
  },
  {
    currency: "hkd",
    symbol: "HK$",
    maxDecimals: 1,
    locale: "en-HK",
  },
  {
    currency: "cny",
    symbol: "¥",
    maxDecimals: 1,
    locale: "zh-CN",
  },
  {
    currency: "jpy",
    symbol: "¥",
    maxDecimals: 0,
    locale: "ja-JP",
  },
  {
    currency: "inr",
    symbol: "₹",
    maxDecimals: 1,
    locale: "en-IN",
  },
  {
    currency: "chf",
    symbol: "₣",
    maxDecimals: 2,
    locale: "gsw",
  },
  {
    currency: "pkr",
    symbol: "Rs",
    maxDecimals: 0,
    locale: "en-PK",
  },
];

export const GoogleMeasurementId =
  process.env["KEPLR_EXT_GOOGLE_MEASUREMENT_ID"] || "";
export const GoogleAPIKeyForMeasurement =
  process.env["KEPLR_EXT_GOOGLE_API_KEY_FOR_MEASUREMENT"] || "";

export const ICNSInfo = {
  chainId: "osmosis-1",
  resolverContractAddress:
    "osmo1xk0s8xgktn9x5vwcgtjdxqzadg88fgn33p8u9cnpdxwemvxscvast52cdd",
};

export const ENSInfo = {
  chainId: "eip155:1",
};

export interface FiatOnRampServiceInfo {
  serviceId: string;
  serviceName: string;
  buyOrigin: string;
  buySupportCoinDenomsByChainId: Record<string, string[] | undefined>;
  apiKey?: string;
}

export const FiatOnRampServiceInfos: FiatOnRampServiceInfo[] = [
  {
    serviceId: "kado",
    serviceName: "Kado",
    buyOrigin: "https://app.kado.money",
    buySupportCoinDenomsByChainId: {
      "osmosis-1": ["USDC"],
      "juno-1": ["USDC"],
      "phoenix-1": ["USDC"],
      "cosmoshub-4": ["ATOM"],
      "injective-1": ["USDT"],
    },
  },
  {
    serviceId: "transak",
    serviceName: "Transak",
    buyOrigin: "https://global.transak.com",
    buySupportCoinDenomsByChainId: {
      "osmosis-1": ["OSMO"],
      "cosmoshub-4": ["ATOM"],
      "secret-4": ["SCRT"],
      "injective-1": ["INJ"],
    },
  },
  {
    serviceId: "moonpay",
    serviceName: "Moonpay",
    buyOrigin: "https://buy.moonpay.com",
    buySupportCoinDenomsByChainId: {
      "cosmoshub-4": ["ATOM"],
      "kava_2222-10": ["KAVA"],
    },
  },
];

// 현재는 osmosis밖에 지원하지 않는다.
// 코드 자체가 osmosis에 종속되어 있기 때문에, 다른 체인을 지원하려면 코드를 수정해야 한다.
// 단지 미래에 달라질 가능성이 있어보여서 빼놨을 뿐임
export const SwapVenue: {
  name: string;
  chainId: string;
} = {
  name: "osmosis-poolmanager",
  chainId: "osmosis-1",
};
export const SwapFeeBps = {
  value: 75,
  receiver: "osmo1my4tk420gjmhggqwvvha6ey9390gqwfree2p4u",
};
