import { useStore } from "../../stores";
import { useBitcoinAddresses } from "./use-bitcoin-network-config";
import { useGetInscriptionsByAddress } from "./use-get-inscriptions";
import { useGetRunesOutputsByAddress } from "./use-get-runes-outputs";
import { CoinPretty, Dec } from "@keplr-wallet/unit";

export const useGetUTXOs = (
  chainId: string,
  address: string,
  inscriptionProtected: boolean
) => {
  const { chainStore, bitcoinQueriesStore } = useStore();

  const modularChainInfo = chainStore.getModularChain(chainId);
  if (!("bitcoin" in modularChainInfo)) {
    throw new Error("Unsupported chain");
  }

  const currency = modularChainInfo.bitcoin.currencies[0];
  if (!currency) {
    throw new Error("Bitcoin currency not found");
  }

  const { isFetching: isFetchingInscriptions, pages: inscriptionsPages } =
    useGetInscriptionsByAddress(chainId, inscriptionProtected ? address : "");
  const { isFetching: isFetchingRunesOutputs, pages: runesPages } =
    useGetRunesOutputsByAddress(chainId, address);

  const queryUTXOs = bitcoinQueriesStore
    .get(chainId)
    .queryBitcoinUTXOs.getUTXOs(chainId, chainStore, address);

  const confirmedUTXOs = queryUTXOs?.confirmedUTXOs || [];

  // Extract inscribed UTXOs
  const inscribedUTXOs = inscriptionsPages
    ?.flatMap((page) => page.response?.data ?? [])
    .map((inscription) => {
      const { satpoint } = inscription;
      const [txid, vout] = satpoint.split(":");
      return {
        txid,
        vout: Number(vout),
      };
    });

  // Extract runes UTXOs
  const runesUTXOs = runesPages
    ?.flatMap((page) => page.response?.data ?? [])
    .filter(Boolean)
    .map((runesOutput) => {
      const { output } = runesOutput;
      const [txid, vout] = output.split(":");
      return {
        txid,
        vout: Number(vout),
      };
    });

  // Create lookup maps for faster filtering
  const protectedUTXOs = new Set(
    [...inscribedUTXOs, ...runesUTXOs].map(
      (utxo) => `${utxo.txid}:${utxo.vout}`
    )
  );

  // Filter out UTXOs that are inscribed, runes
  const { availableUTXOs, availableBalance } = (() => {
    const availableUTXOs = confirmedUTXOs.filter((utxo) => {
      const key = `${utxo.txid}:${utxo.vout}`;
      return !protectedUTXOs.has(key);
    });

    const availableBalance = new CoinPretty(
      currency,
      availableUTXOs.reduce((acc, utxo) => {
        return acc.add(new Dec(utxo.value));
      }, new Dec(0))
    );

    return {
      availableUTXOs,
      availableBalance,
    };
  })();

  const isFetching =
    isFetchingInscriptions || isFetchingRunesOutputs || queryUTXOs?.isFetching;

  // Determine if there's an error
  const error =
    queryUTXOs?.error ||
    (inscriptionsPages?.some((page) => page.error)
      ? inscriptionsPages.find((page) => page.error)?.error
      : undefined) ||
    (runesPages?.some((page) => page.error)
      ? runesPages.find((page) => page.error)?.error
      : undefined);

  return {
    isFetching,
    error,
    confirmedUTXOs,
    inscribedUTXOs,
    runesUTXOs,
    availableUTXOs,
    availableBalance,
  };
};

export const useGetNativeSegwitUTXOs = (chainId: string) => {
  const { nativeSegwitAddress } = useBitcoinAddresses(chainId);

  return useGetUTXOs(chainId, nativeSegwitAddress ?? "", false);
};

export const useGetTaprootUTXOs = (chainId: string) => {
  const { taprootAddress } = useBitcoinAddresses(chainId);
  return useGetUTXOs(chainId, taprootAddress ?? "", true);
};
