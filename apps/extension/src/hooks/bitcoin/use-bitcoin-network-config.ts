import { useMemo } from "react";
import { useStore } from "../../stores";
import {
  GENESIS_HASH_TO_NETWORK,
  GenesisHash,
  SupportedPaymentType,
} from "@keplr-wallet/types";
import { Network, networks, payments } from "bitcoinjs-lib";
import { toXOnly } from "@keplr-wallet/crypto";

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

export const useBitcoinAddresses = (chainId: string) => {
  const { accountStore } = useStore();
  const { networkConfig } = useBitcoinNetworkConfig(chainId);

  const legacyAddress = useMemo(() => {
    const pubkey = accountStore.getAccount(chainId).pubKey;
    if (!pubkey) {
      return undefined;
    }

    const { address } = payments.p2pkh({
      pubkey: Buffer.from(pubkey),
      network: networkConfig,
    });

    return address;
  }, [accountStore, chainId, networkConfig]);

  const nativeSegwitAddress = useMemo(() => {
    const pubkey = accountStore.getAccount(chainId).pubKey;
    if (!pubkey) {
      return undefined;
    }

    const { address } = payments.p2wpkh({
      pubkey: Buffer.from(pubkey),
      network: networkConfig,
    });

    return address;
  }, [accountStore, chainId, networkConfig]);

  const taprootAddress = useMemo(() => {
    const pubkey = accountStore.getAccount(chainId).pubKey;
    if (!pubkey) {
      return undefined;
    }

    const { address } = payments.p2tr({
      internalPubkey: toXOnly(Buffer.from(pubkey)),
      network: networkConfig,
    });

    return address;
  }, [accountStore, chainId, networkConfig]);

  return {
    legacyAddress,
    nativeSegwitAddress,
    taprootAddress,
  };
};
