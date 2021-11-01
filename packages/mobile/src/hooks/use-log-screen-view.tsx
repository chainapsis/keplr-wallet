import { useCallback } from "react";
import { EventProperties } from "../stores/analytics";
import { useStore } from "../stores";
import { useFocusEffect } from "@react-navigation/native";

export const useLogScreenView = (
  screenName: string,
  eventProperties?: EventProperties
): void => {
  const { analyticsStore, priceStore, accountStore } = useStore();
  const accountInfo = accountStore.getAccount(analyticsStore.mainChainId);

  useFocusEffect(
    useCallback(() => {
      if (analyticsStore.isInitialized) {
        analyticsStore.setUserId(accountInfo.bech32Address);
        analyticsStore.setUserProperties({
          currency: priceStore.defaultVsCurrency,
        });
        analyticsStore.logScreenView(screenName, eventProperties);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [analyticsStore.isInitialized])
  );
};
