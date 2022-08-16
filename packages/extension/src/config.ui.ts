// Seperate shared config from UI config to prevent code mixup between UI and background process code.
import { RegisterOption } from "@keplr-wallet/hooks";
import {
  ETHEREUM_ENDPOINT,
  ADDITIONAL_INTL_MESSAGES,
  ADDITIONAL_SIGN_IN_PREPEND,
  AMPLITUDE_API_KEY,
} from "./config.ui.var";
import {
  IntlMessages,
  LanguageToFiatCurrency as TypeLanguageToFiatCurrency,
} from "./languages";
import { FiatCurrency } from "@keplr-wallet/types";

export const CoinGeckoAPIEndPoint = "https://api.coingecko.com/api/v3";
export const CoinGeckoGetPrice = "/simple/price";
export const AutoFetchingFiatValueInterval = 300 * 1000; // 5min

export const AutoFetchingAssetsInterval = 15 * 1000; // 15sec

export const DefaultGasMsgWithdrawRewards = 140000; // Gas per messages.

// Endpoint for Ethereum node.
// This is used for ENS.
export const EthereumEndpoint = ETHEREUM_ENDPOINT;

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

export const AdditonalIntlMessages: IntlMessages = ADDITIONAL_INTL_MESSAGES;

export const AmplitudeApiKey = AMPLITUDE_API_KEY;
