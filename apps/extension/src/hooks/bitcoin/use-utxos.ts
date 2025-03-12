import { useStore } from "../../stores";
import { useBitcoinAddresses } from "./use-bitcoin-network-config";

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
  const { nativeSegwitAddress } = useBitcoinAddresses(chainId);

  return useUTXOs(chainId, nativeSegwitAddress ?? "");
};

export const useTaprootUTXOs = (chainId: string) => {
  const { taprootAddress } = useBitcoinAddresses(chainId);
  return useUTXOs(chainId, taprootAddress ?? "");
};
