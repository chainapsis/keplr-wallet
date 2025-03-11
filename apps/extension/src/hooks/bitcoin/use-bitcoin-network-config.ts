import { useMemo } from "react";
import { useStore } from "../../stores";
import {
  GENESIS_HASH_TO_NETWORK,
  GenesisHash,
  SupportedPaymentType,
} from "@keplr-wallet/types";
import { Network, networks } from "bitcoinjs-lib";

enum BestInSlotApiUrl {
  MAINNET = "https://api.bestinslot.xyz/v3",
  TESTNET = "https://testnet.api.bestinslot.xyz/v3",
  SIGNET = "https://signet_api.bestinslot.xyz/v3",
}

export const useBitcoinNetworkConfig = (chainId: string) => {
  const { chainStore } = useStore();

  const modularChainInfo = chainStore.getModularChain(chainId);
  if (!("bitcoin" in modularChainInfo)) {
    throw new Error("Not a bitcoin chain");
  }

  return useMemo(() => {
    const [, genesisHash, paymentType] = chainId.split(":");

    const currentNetwork = GENESIS_HASH_TO_NETWORK[genesisHash as GenesisHash];

    let bestInSlotApiUrl = "";
    let networkConfig: Network | undefined;

    switch (currentNetwork) {
      case "mainnet":
        bestInSlotApiUrl = BestInSlotApiUrl.MAINNET;
        networkConfig = networks.bitcoin;
        break;
      case "testnet":
        bestInSlotApiUrl = BestInSlotApiUrl.TESTNET;
        networkConfig = networks.testnet;
        break;
      case "signet":
        bestInSlotApiUrl = BestInSlotApiUrl.SIGNET;
        networkConfig = networks.testnet;
        break;
      default:
        throw new Error("Unknown network");
    }

    return {
      currentNetwork,
      currentPaymentType: paymentType as SupportedPaymentType,
      bestInSlotApiUrl,
      networkConfig,
    };
  }, [chainId]);
};
