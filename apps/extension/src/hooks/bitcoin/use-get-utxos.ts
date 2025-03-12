import { NATIVE_SEGWIT_DUST_THRESHOLD } from "@keplr-wallet/stores-bitcoin";
import { useStore } from "../../stores";
import { useBitcoinAddresses } from "./use-bitcoin-network-config";
import { useGetInscriptionsByAddress } from "./use-get-inscriptions";
import { useGetRunesOutputsByAddress } from "./use-get-runes-outputs";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { useMemo } from "react";

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

  const confirmedUTXOs = useMemo(
    () => queryUTXOs?.confirmedUTXOs || [],
    [queryUTXOs]
  );

  // Extract inscribed UTXOs
  const inscribedUTXOs = useMemo(
    () =>
      inscriptionsPages
        ?.flatMap((page) => page.response?.data ?? [])
        .map((inscription) => {
          const { satpoint } = inscription;
          const [txid, vout] = satpoint.split(":");
          return {
            txid,
            vout: Number(vout),
          };
        }),
    [inscriptionsPages]
  );

  // Extract runes UTXOs
  const runesUTXOs = useMemo(
    () =>
      runesPages
        ?.flatMap((page) => page.response?.data ?? [])
        .filter(Boolean)
        .map((runesOutput) => {
          const { output } = runesOutput;
          const [txid, vout] = output.split(":");
          return {
            txid,
            vout: Number(vout),
          };
        }) || [],
    [runesPages]
  );

  // Identify dust UTXOs with memoization
  const uncommercialUTXOs = useMemo(
    () =>
      confirmedUTXOs.filter(
        (utxo) => utxo.value < NATIVE_SEGWIT_DUST_THRESHOLD * 2
      ),
    [confirmedUTXOs]
  );

  // Create lookup maps for faster filtering
  const { isInscribedMap, isRunesMap, isUncommercialMap } = useMemo(
    () => ({
      isInscribedMap: new Map(
        inscribedUTXOs.map((utxo) => [`${utxo.txid}:${utxo.vout}`, true])
      ),
      isRunesMap: new Map(
        runesUTXOs.map((utxo) => [`${utxo.txid}:${utxo.vout}`, true])
      ),
      isUncommercialMap: new Map(
        uncommercialUTXOs.map((utxo) => [`${utxo.txid}:${utxo.vout}`, true])
      ),
    }),
    [inscribedUTXOs, runesUTXOs, uncommercialUTXOs]
  );

  // Filter out UTXOs that are inscribed, runes, or uncommercial
  const { availableUTXOs, availableBalance } = useMemo(() => {
    const availableUTXOs = confirmedUTXOs.filter((utxo) => {
      const key = `${utxo.txid}:${utxo.vout}`;
      return (
        !isInscribedMap.has(key) &&
        !isRunesMap.has(key) &&
        !isUncommercialMap.has(key)
      );
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
  }, [confirmedUTXOs, currency, isInscribedMap, isRunesMap, isUncommercialMap]);

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
