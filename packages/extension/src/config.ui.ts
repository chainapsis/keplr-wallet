// Seperate shared config from UI config to prevent code mixup between UI and background process code.
import { FiatCurrency } from "@keplr-wallet/types";

export const CoinGeckoAPIEndPoint = "https://api.coingecko.com/api/v3";
export const CoinGeckoGetPrice = "/simple/price";
export const AutoFetchingFiatValueInterval = 300 * 1000; // 5min

export const AutoFetchingAssetsInterval = 15 * 1000; // 15sec

export const DefaultGasMsgWithdrawRewards = 240000; // Gas per messages.

// Endpoint for Ethereum node.
// This is used for ENS.
export const EthereumEndpoint =
  process.env["KEPLR_EXT_ETHEREUM_ENDPOINT"] || "";

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
];

export const AmplitudeApiKey = process.env["KEPLR_EXT_AMPLITUDE_API_KEY"] || "";

export const ICNSInfo = {
  chainId: "osmosis-1",
  resolverContractAddress:
    "osmo1xk0s8xgktn9x5vwcgtjdxqzadg88fgn33p8u9cnpdxwemvxscvast52cdd",
};

// If not needed, just set as empty string ("")
export const ICNSFrontendLink: string = "https://app.icns.xyz";

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
