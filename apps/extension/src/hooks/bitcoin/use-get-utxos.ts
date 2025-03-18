import { useStore } from "../../stores";
import { useGetInscriptionsByAddress } from "./use-get-inscriptions";
import { useGetRunesOutputsByAddress } from "./use-get-runes-outputs";
import { CoinPretty, Dec } from "@keplr-wallet/unit";

export const useGetUTXOs = (
  chainId: string,
  address: string,
  inscriptionProtected: boolean,
  runesProtected: boolean
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
    useGetRunesOutputsByAddress(chainId, runesProtected ? address : "");

  const queryUTXOs = bitcoinQueriesStore
    .get(chainId)
    .queryBitcoinUTXOs.getUTXOs(chainId, chainStore, address);

  const confirmedUTXOs = queryUTXOs?.confirmedUTXOs || [];

  const queryAddressTxs = bitcoinQueriesStore
    .get(chainId)
    .queryBitcoinAddressTxs.getTxs(chainId, chainStore, address);

  const txs = queryAddressTxs?.response?.data ?? [];

  // Get recently used UTXOs
  const recentlyUsedUTXOs = txs.flatMap((tx) => {
    return tx.vin.map((input) => {
      return {
        txid: input.txid,
        vout: input.vout,
      };
    });
  });

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
    [...inscribedUTXOs, ...runesUTXOs, ...recentlyUsedUTXOs].map(
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
    isFetchingInscriptions ||
    isFetchingRunesOutputs ||
    queryUTXOs?.isFetching ||
    queryAddressTxs?.isFetching;

  // Determine if there's an error
  const error =
    queryUTXOs?.error ||
    queryAddressTxs?.error ||
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
