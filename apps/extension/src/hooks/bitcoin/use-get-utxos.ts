import { useState } from "react";
import { DUST_THRESHOLD } from "@keplr-wallet/stores-bitcoin";
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
  const [allowUnfilteredOnApiError, setAllowUnfilteredOnApiError] =
    useState(false);
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

  const hasInscriptionsApiError =
    inscriptionProtected &&
    inscriptionsPages?.some((page) => page.error) &&
    !isFetchingInscriptions;
  const hasRunesApiError =
    runesProtected &&
    runesPages?.some((page) => page.error) &&
    !isFetchingRunesOutputs;

  const indexerIsHealthy =
    !queryUTXOs?.error &&
    (!queryUTXOs?.isFetching || confirmedUTXOs.length > 0);

  const hasApiError = hasInscriptionsApiError || hasRunesApiError;

  const shouldSkipFiltering =
    allowUnfilteredOnApiError && indexerIsHealthy && hasApiError;

  const isUnfiltered = hasApiError && indexerIsHealthy;

  // NOTE: inscriptions/runes 조회 결과에 오류가 있고 사용자가 허용한 경우 빈 배열을 반환한다.
  // inscriptions/runes 조회는 명시적으로 파이지네이션으로 구현이 되어있지만, 이 훅에서는 파이지네이션을 사용하지 않는다.
  // 따라서, 조회 오류가 있는 경우는 항상 빈 배열을 반환하게 된다.

  const inscribedUTXOs =
    hasInscriptionsApiError && allowUnfilteredOnApiError
      ? []
      : inscriptionsPages
          ?.filter((page) => !page.error)
          ?.flatMap((page) => page.response?.data ?? [])
          .map((inscription) => {
            const { satpoint } = inscription;
            const [txid, vout] = satpoint.split(":");
            return {
              txid,
              vout: Number(vout),
            };
          });

  const runesUTXOs =
    hasRunesApiError && allowUnfilteredOnApiError
      ? []
      : runesPages
          ?.filter((page) => !page.error)
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
      return !protectedUTXOs.has(key) && utxo.value >= DUST_THRESHOLD;
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

  const indexerError = queryUTXOs?.error;
  const apiError =
    (hasInscriptionsApiError
      ? inscriptionsPages.find((page) => page.error)?.error
      : undefined) ||
    (hasRunesApiError
      ? runesPages.find((page) => page.error)?.error
      : undefined);

  const error = indexerError || apiError;

  return {
    isFetching,
    error,
    indexerError,
    apiError,
    confirmedUTXOs,
    inscribedUTXOs,
    runesUTXOs,
    availableUTXOs,
    availableBalance,
    shouldSkipFiltering,
    isUnfiltered,
    allowUnfilteredOnApiError,
    setAllowUnfilteredOnApiError,
  };
};
