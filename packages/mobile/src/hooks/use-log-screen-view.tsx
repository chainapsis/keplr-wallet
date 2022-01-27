import { useCallback } from "react";
import { useAnalytics, EventProperties } from "../providers/analytics";
import { useStore } from "../stores";
import { useFocusEffect } from "@react-navigation/native";

export const useLogScreenView = (
  screenName: string,
  eventProperties?: EventProperties
): void => {
  const analytics = useAnalytics();
  const { chainStore, priceStore, accountStore } = useStore();

  const currentChainInfo = chainStore.getChain(chainStore.current.chainId);
  const defaultAccountInfo = accountStore.getAccount("cosmoshub-4");

  useFocusEffect(
    useCallback(() => {
      if (analytics.isInitialized) {
        if (eventProperties) {
          eventProperties.chainId = currentChainInfo.chainId;
          eventProperties.chainName = currentChainInfo.chainName;
        }
        analytics.setUserId(defaultAccountInfo.bech32Address);
        analytics.setUserProperties({
          currency: priceStore.defaultVsCurrency,
        });
        analytics.logScreenView(screenName, eventProperties);
      }
    }, [
      analytics,
      currentChainInfo.chainId,
      currentChainInfo.chainName,
      defaultAccountInfo.bech32Address,
      eventProperties,
      priceStore.defaultVsCurrency,
      screenName,
    ])
  );
};
