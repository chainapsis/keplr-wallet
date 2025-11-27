import { useEffect, useRef } from "react";
import { useLocation } from "react-router";
import { autorun } from "mobx";
import {
  IFeeConfig,
  InsufficientFeeError,
  ISenderConfig,
} from "@keplr-wallet/hooks";
import { useStore } from "../../stores";
import { ChainIdHelper } from "@keplr-wallet/cosmos";

export const useInsufficientFeeAnalytics = (
  feeConfig: IFeeConfig,
  senderConfig: ISenderConfig,
  forceTopUp?: boolean
) => {
  const location = useLocation();
  const { analyticsAmplitudeStore, chainStore, queriesStore } = useStore();

  const loggedKeySetRef = useRef(new Set<string>());

  useEffect(() => {
    const disposer = autorun(() => {
      if (forceTopUp) {
        return;
      }

      const error = feeConfig.uiProperties.error;
      if (!(error instanceof InsufficientFeeError)) {
        return;
      }

      const chainId = feeConfig.chainId;
      const pathname = location.pathname;
      const sender = senderConfig.sender;
      if (!sender) {
        return;
      }

      const key = `${pathname}|${chainId}|${sender}`;
      if (loggedKeySetRef.current.has(key)) {
        return;
      }

      const keplrETC = queriesStore.get(chainId).keplrETC;

      if (!keplrETC) {
        return;
      }

      const topUpStatusQuery = keplrETC.queryTopUpStatus.getTopUpStatus(sender);
      if (topUpStatusQuery.isFetching) {
        return;
      }

      if (
        (topUpStatusQuery.error?.data as any)?.error === "Chain not supported"
      ) {
        analyticsAmplitudeStore.logEvent("view_insufficient_fee_error", {
          pathname,
          chainIdentifier: ChainIdHelper.parse(chainId).identifier,
          chainName: chainStore.hasModularChain(chainId)
            ? chainStore.getModularChain(chainId).chainName
            : undefined,
          feeCurrencyDenom: feeConfig.fees[0].currency.coinMinimalDenom,
        });

        loggedKeySetRef.current.add(key);
      }
    });

    return () => {
      disposer();
    };
  }, [
    analyticsAmplitudeStore,
    chainStore,
    feeConfig,
    location.pathname,
    queriesStore,
    senderConfig.sender,
    forceTopUp,
  ]);
};
