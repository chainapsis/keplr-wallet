import { Bech32Address } from "@keplr-wallet/cosmos";
import { ChainInfo } from "@keplr-wallet/types";

import { PRIVILEGED_ORIGINS } from "./config.var";

export const EmbedChainInfos: ChainInfo[] = [
  {
    rpc: "https://rpc-stargateworld.fetch.ai",
    rest: "https://rest-stargateworld.fetch.ai",
    chainId: "stargateworld-2",
    chainName: "Stargate World",
    stakeCurrency: {
      coinDenom: "TESTFET",
      coinMinimalDenom: "atestfet",
      coinDecimals: 18,
      coinGeckoId: "fetch-ai",
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
  },
];

// The origins that are able to pass any permission that external webpages can have.
export const PrivilegedOrigins: string[] = PRIVILEGED_ORIGINS;
