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
  "/onchain/networks/{coingeckoChainId}/tokens/{contractAddress}";

// 일단 CoinGecko API와 같은 base url을 사용함
export const SkipTokenInfoBaseURL =
  process.env["KEPLR_EXT_COINGECKO_ENDPOINT"] || "";
export const SkipTokenInfoAPIURI =
  process.env["KEPLR_EXT_SKIP_TOKEN_INFO_API_URI"] ||
  "/coingecko-token-info/skip/assets/{chainId}/{coinMinimalDenom}";

export const AutoFetchingFiatValueInterval = 300 * 1000; // 5min

export const AutoFetchingAssetsInterval = 15 * 1000; // 15sec

export const DefaultGasMsgWithdrawRewards = 240000; // Gas per messages.

// Endpoint for Ethereum node.
// This is used for ENS.
export const EthereumEndpoint =
  process.env["KEPLR_EXT_ETHEREUM_ENDPOINT"] || "";

export const TokenContractListRepoURL =
  "https://github.com/chainapsis/keplr-contract-registry";
export const NeutronStakingRewardsContractAddress =
  "neutron1gqq3c735pj6ese3yru5xr6ud0fvxgltxesygvyyzpsrt74v6yg4sgkrgwq";

export const NOBLE_CHAIN_ID = "noble-1";
export const NEUTRON_CHAIN_ID = "neutron-1";
export const INITIA_CHAIN_ID = "interwoven-1";

export const KEPLR_EXTS_MEMO = "Keplr Exts";

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

export const AmplitudeAPIKey = process.env["KEPLR_EXT_AMPLITUDE_API_KEY"] || "";

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

export const SwapVenues: {
  name: string;
  chainId: string;
}[] = [
  { name: "terra-phoenix", chainId: "phoenix-1" },
  { name: "chihuahua-white-whale", chainId: "chihuahua-1" },
  { name: "injective-dojoswap", chainId: "injective-1" },
  { name: "injective-white-whale", chainId: "injective-1" },
  { name: "elys-native", chainId: "elys-1" },
  { name: "neutron-astroport", chainId: "neutron-1" },
  { name: "neutron-astrovault", chainId: "neutron-1" },
  { name: "terra-nauticus", chainId: "phoenix-1" },
  { name: "terra-white-whale", chainId: "phoenix-1" },
  { name: "neutron-lido-satellite", chainId: "neutron-1" },
  { name: "neutron-drop", chainId: "neutron-1" },
  { name: "injective-helix", chainId: "injective-1" },
  { name: "neutron-duality", chainId: "neutron-1" },
  { name: "terra-astroport", chainId: "phoenix-1" },
  { name: "terra-ura", chainId: "phoenix-1" },
  { name: "babylon-tower", chainId: "bbn-1" },
  { name: "osmosis-poolmanager", chainId: "osmosis-1" },
  { name: "initia-dex", chainId: "interwoven-1" },
  { name: "pryzm-native", chainId: "pryzm-1" },
  { name: "persistence-dexter", chainId: "core-1" },
  { name: "terra-terraswap", chainId: "phoenix-1" },
  { name: "injective-astroport", chainId: "injective-1" },
  { name: "blast-uniswap", chainId: "eip155:81457" },
  { name: "binance-uniswap", chainId: "eip155:56" },
  { name: "optimism-uniswap", chainId: "eip155:10" },
  { name: "polygon-uniswap", chainId: "eip155:137" },
  { name: "arbitrum-uniswap", chainId: "eip155:42161" },
  { name: "avalanche-uniswap", chainId: "eip155:43114" },
  { name: "base-uniswap", chainId: "eip155:8453" },
  { name: "ethereum-uniswap", chainId: "eip155:1" },
  { name: "base-aerodrome", chainId: "eip155:8453" },
  // Forma가 destination asset에 뜨게하기 위해 임시로 추가
  // 실제 swap venue로 사용되진 않음
  {
    name: "temp-forma",
    chainId: "eip155:984122",
  },
];

export const SwapFeeBps = {
  value: 75,
  receivers: [
    {
      chainId: "osmosis-1",
      address: "osmo1my4tk420gjmhggqwvvha6ey9390gqwfree2p4u",
    },
    {
      chainId: "injective-1",
      address: "inj1tfn0awxutuvrgqvme7g3e9nd2fe5r3uzqa4fjr",
    },
    {
      chainId: "neutron-1",
      address: "neutron1my4tk420gjmhggqwvvha6ey9390gqwfr4asnef",
    },
    {
      chainId: "core-1",
      address: "persistence1my4tk420gjmhggqwvvha6ey9390gqwfrlwlzd2",
    },
    {
      chainId: "pryzm-1",
      address: "pryzm1my4tk420gjmhggqwvvha6ey9390gqwfrfjwkaa",
    },
    {
      chainId: "chihuahua-1",
      address: "chihuahua1my4tk420gjmhggqwvvha6ey9390gqwfrjh5lzv",
    },
  ],
};
