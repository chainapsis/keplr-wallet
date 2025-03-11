import { useMemo } from "react";
import { useStore } from "../../stores";
import { payments } from "bitcoinjs-lib";
import { toXOnly } from "@keplr-wallet/crypto";
import { useBitcoinNetworkConfig } from "./use-bitcoin-network-config";

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
  const { networkConfig } = useBitcoinNetworkConfig(chainId);

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

  return useUTXOs(chainId, nativeSegwitAddress ?? "");
};

export const useTaprootUTXOs = (chainId: string) => {
  const { accountStore } = useStore();
  const { networkConfig } = useBitcoinNetworkConfig(chainId);

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

  return useUTXOs(chainId, taprootAddress ?? "");
};
