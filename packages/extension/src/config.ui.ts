// Seperate shared config from UI config to prevent code mixup between UI and background process code.
import { RegisterOption } from "@keplr-wallet/hooks";
import {
  IntlMessages,
  LanguageToFiatCurrency as TypeLanguageToFiatCurrency,
} from "./languages";
import { FiatCurrency, Currency } from "@keplr-wallet/types";
import {
  ADDITIONAL_SIGN_IN_PREPEND,
  ADDITIONAL_INTL_MESSAGES,
} from "alt-sign-in";

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

export const LanguageToFiatCurrency: TypeLanguageToFiatCurrency = {
  default: "usd",
  ko: "krw",
};

export const AdditionalSignInPrepend:
  | RegisterOption[]
  | undefined = ADDITIONAL_SIGN_IN_PREPEND;

export const AdditionalIntlMessages: IntlMessages = ADDITIONAL_INTL_MESSAGES;

export const LegacyAmplitudeApiKey =
  process.env["KEPLR_EXT_LEGACY_AMPLITUDE_API_KEY"] || "";

export const AmplitudeApiKey = process.env["KEPLR_EXT_AMPLITUDE_API_KEY"] || "";

export const ICNSInfo = {
  chainId: "osmosis-1",
  resolverContractAddress:
    "osmo1xk0s8xgktn9x5vwcgtjdxqzadg88fgn33p8u9cnpdxwemvxscvast52cdd",
};

// If not needed, just set as empty string ("")
export const ICNSFrontendLink: string = "https://app.icns.xyz";

export interface FiatOnRampServiceInfo {
  serviceId: "moonpay" | "transak" | "kado";
  serviceName: "MoonPay" | "Transak" | "Kado";
  apiKey?: string;
  buyOrigin: string;
  buySupportChainIds: string[];
  buySupportCurrencies?: Currency[];
  buySupportCurrenciesByChainId?: Record<string, Currency[]>;
}

export const FiatOnRampServiceInfos: FiatOnRampServiceInfo[] = [
  {
    serviceId: "transak",
    serviceName: "Transak",
    apiKey: process.env["KEPLR_EXT_TRANSAK_API_KEY"] || "",
    buyOrigin: "https://global.transak.com",
    buySupportChainIds: ["osmosis-1", "cosmoshub-4", "secret-4"],
  },
  {
    serviceId: "moonpay",
    serviceName: "MoonPay",
    apiKey: process.env["KEPLR_EXT_MOONPAY_API_KEY"] || "",
    buyOrigin: "https://buy.moonpay.com",
    buySupportChainIds: ["cosmoshub-4", "kava_2222-10"],
  },
  {
    serviceId: "kado",
    serviceName: "Kado",
    apiKey: process.env["KEPLR_EXT_KADO_API_KEY"] || "",
    buyOrigin: "https://app.kado.money",
    buySupportChainIds: [
      "cosmoshub-4",
      "osmosis-1",
      "juno-1",
      "phoenix-1",
      "injective-1",
    ],
    buySupportCurrencies: [
      {
        coinDenom: "ATOM",
        coinMinimalDenom: "uatom",
        coinDecimals: 6,
        coinGeckoId: "cosmos",
      },
      {
        coinDenom: "USDC",
        coinMinimalDenom: "uusdc",
        coinDecimals: 6,
        coinGeckoId: "usd-coin",
      },
      {
        coinDenom: "USDT",
        coinMinimalDenom: "uusdt",
        coinDecimals: 6,
        coinGeckoId: "tether",
      },
    ],
    buySupportCurrenciesByChainId: {
      "cosmoshub-4": [
        {
          coinDenom: "ATOM",
          coinMinimalDenom: "uatom",
          coinDecimals: 6,
          coinGeckoId: "cosmos",
        },
      ],
      "osmosis-1": [
        {
          coinDenom: "USDC",
          coinMinimalDenom: "uusdc",
          coinDecimals: 6,
          coinGeckoId: "usd-coin",
        },
      ],
      "juno-1": [
        {
          coinDenom: "USDC",
          coinMinimalDenom: "uusdc",
          coinDecimals: 6,
          coinGeckoId: "usd-coin",
        },
      ],
      "phoenix-1": [
        {
          coinDenom: "USDC",
          coinMinimalDenom: "uusdc",
          coinDecimals: 6,
          coinGeckoId: "usd-coin",
        },
      ],
      "injective-1": [
        {
          coinDenom: "USDT",
          coinMinimalDenom: "uusdt",
          coinDecimals: 6,
          coinGeckoId: "tether",
        },
      ],
    },
  },
];
