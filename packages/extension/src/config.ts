import { Bech32Address } from "@keplr-wallet/cosmos";
import { ChainInfo } from "@keplr-wallet/types";

import { PRIVILEGED_ORIGINS } from "./config.var";

export const EmbedChainInfos: ChainInfo[] = [
  // {
  //   rpc: "https://rpc-fetchhub.fetch-ai.com:443",
  //   // rpcConfig: COSMOS_RPC_CONFIG,
  //   rest: "https://rest-fetchhub.fetch-ai.com:443",
  //   // restConfig: COSMOS_REST_CONFIG,
  //   chainId: "fetchhub-1",
  //   chainName: "Fetch.ai",
  //   stakeCurrency: {
  //     coinDenom: "FET",
  //     coinMinimalDenom: "afet",
  //     coinDecimals: 18,
  //     coinGeckoId: "fetch-ai",
  //   },
  //   // walletUrl:
  //   //   process.env.NODE_ENV === "production"
  //   //     ? "https://wallet.keplr.app/#/cosmoshub/stake"
  //   //     : "http://localhost:8081/#/cosmoshub/stake",
  //   // walletUrlForStaking:
  //   //   process.env.NODE_ENV === "production"
  //   //     ? "https://wallet.keplr.app/#/cosmoshub/stake"
  //   //     : "http://localhost:8081/#/cosmoshub/stake",
  //   bip44: {
  //     coinType: 118,
  //   },
  //   bech32Config: Bech32Address.defaultBech32Config("fetch"),
  //   currencies: [
  //     {
  //       coinDenom: "FET",
  //       coinMinimalDenom: "afet",
  //       coinDecimals: 18,
  //       // coinGeckoId: "cosmos",
  //     },
  //   ],
  //   feeCurrencies: [
  //     {
  //       coinDenom: "FET",
  //       coinMinimalDenom: "afet",
  //       coinDecimals: 6,
  //       // coinGeckoId: "cosmos",
  //     },
  //   ],
  //   coinType: 118,
  //   features: [],
  // },
  {
    rpc: "https://rpc-flavienworld.sandbox-london-b.fetch-ai.com",
    rest: "https://rest-flavienworld.sandbox-london-b.fetch-ai.com",
    chainId: "flavienworld-1",
    chainName: "Flavien World",
    stakeCurrency: {
      coinDenom: "TESTFET",
      coinMinimalDenom: "atestfet",
      coinDecimals: 18,
      coinGeckoId: "fetch-ai",
    },
    // walletUrl:
    //   process.env.NODE_ENV === "production"
    //     ? "https://wallet.keplr.app/#/cosmoshub/stake"
    //     : "http://localhost:8081/#/cosmoshub/stake",
    // walletUrlForStaking:
    //   process.env.NODE_ENV === "production"
    //     ? "https://wallet.keplr.app/#/cosmoshub/stake"
    //     : "http://localhost:8081/#/cosmoshub/stake",
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("fetch"),
    currencies: [
      {
        coinDenom: "TESTFET",
        coinMinimalDenom: "atestfet",
        coinDecimals: 18,
        // coinGeckoId: "cosmos",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "TESTFET",
        coinMinimalDenom: "atestfet",
        coinDecimals: 6,
        // coinGeckoId: "cosmos",
      },
    ],
    coinType: 118,
    features: [], //["stargate", "secretwasm"],
  },
];

// The origins that are able to pass any permission that external webpages can have.
export const PrivilegedOrigins: string[] = PRIVILEGED_ORIGINS;
