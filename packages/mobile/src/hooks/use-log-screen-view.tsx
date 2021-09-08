import { useCallback } from "react";
import { EventProperties } from "../stores/analytics";
import { useStore } from "../stores";
import { useFocusEffect } from "@react-navigation/native";

export const useLogScreenView = (
  screenName: string,
  eventProperties?: EventProperties
): void => {
  const { chainStore, analyticsStore, priceStore } = useStore();

  useFocusEffect(
    useCallback(() => {
      if (analyticsStore.isInitialized) {
        if (eventProperties && eventProperties.chainId) {
          const { chainId } = eventProperties;
          const chainInfo = chainStore.getChain(chainId);
          eventProperties.chainName = chainInfo.chainName;
        }
        analyticsStore.setUserId();
        analyticsStore.setUserProperties({
          currency: priceStore.defaultVsCurrency,
        });
        analyticsStore.logScreenView(screenName, eventProperties);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [analyticsStore.isInitialized])
  );
};
