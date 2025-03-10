import { useMemo } from "react";
import { useStore } from "../../stores";
import { GENESIS_HASH_TO_NETWORK, GenesisHash } from "@keplr-wallet/types";
import { Network, networks, payments } from "bitcoinjs-lib";
import { toXOnly } from "@keplr-wallet/crypto";

export const useUTXOs = (chainId: string, address: string) => {
  const { chainStore, bitcoinQueriesStore } = useStore();

  if (!address) {
    return undefined;
  }

  // TODO: inscription, runes, confirmed 따로 분류하여 조회

  const queryAvailableUTXOs = bitcoinQueriesStore
    .get(chainId)
    .queryBitcoinAvailableUTXOs.getAvailableUTXOs(chainId, chainStore, address);

  return queryAvailableUTXOs?.availableUTXOs;
};

export const useNativeSegwitUTXOs = (chainId: string) => {
  const { accountStore } = useStore();

  const nativeSegwitAddress = useMemo(() => {
    const pubkey = accountStore.getAccount(chainId).pubKey;
    if (!pubkey) {
      return undefined;
    }

    const [, genesisHash] = chainId.split(":");
    const network = GENESIS_HASH_TO_NETWORK[genesisHash as GenesisHash];

    let networkParams: Network | undefined;
    switch (network) {
      case "mainnet":
        networkParams = networks.bitcoin;
        break;
      case "testnet":
        networkParams = networks.testnet;
        break;
      case "signet":
        networkParams = networks.testnet;
        break;
    }

    const { address } = payments.p2wpkh({
      pubkey: Buffer.from(pubkey),
      network: networkParams,
    });

    return address;
  }, [accountStore, chainId]);

  return useUTXOs(chainId, nativeSegwitAddress ?? "");
};

export const useTaprootUTXOs = (chainId: string) => {
  const { accountStore } = useStore();

  const taprootAddress = useMemo(() => {
    const pubkey = accountStore.getAccount(chainId).pubKey;
    if (!pubkey) {
      return undefined;
    }

    const internalPubkey = toXOnly(Buffer.from(pubkey));

    const [, genesisHash] = chainId.split(":");
    const network = GENESIS_HASH_TO_NETWORK[genesisHash as GenesisHash];

    let networkParams: Network | undefined;
    switch (network) {
      case "mainnet":
        networkParams = networks.bitcoin;
        break;
      case "testnet":
        networkParams = networks.testnet;
        break;
      case "signet":
        networkParams = networks.testnet;
        break;
    }

    const { address } = payments.p2tr({
      internalPubkey,
      network: networkParams,
    });

    return address;
  }, [accountStore, chainId]);

  return useUTXOs(chainId, taprootAddress ?? "");
};
