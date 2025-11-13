import { useEffect, useRef } from "react";
import { useLocation } from "react-router";
import { autorun } from "mobx";
import { IFeeConfig, InsufficientFeeError } from "@keplr-wallet/hooks";
import { useStore } from "../../stores";
import { ChainIdHelper } from "@keplr-wallet/cosmos";

export const useInsufficientFeeAnalytics = (
  feeConfig: IFeeConfig,
  forceTopUp?: boolean
) => {
  const location = useLocation();
  const { analyticsAmplitudeStore, chainStore, queriesStore, accountStore } =
    useStore();

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
      const account = accountStore.getAccount(chainId);
      const sender = chainStore.isEvmOnlyChain(chainId)
        ? account.ethereumHexAddress
        : account.bech32Address;
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
          chainName: chainStore.hasChain(chainId)
            ? chainStore.getChain(chainId).chainName
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
    accountStore,
    forceTopUp,
  ]);
};
