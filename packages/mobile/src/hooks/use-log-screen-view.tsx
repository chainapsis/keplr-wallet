import { useEffect } from "react";
import { useAnalytics } from "../providers/analytics";
import { EventProperties } from "@keplr-wallet/analytics";
import { useStore } from "../stores";

export const useLogScreenView = (
  screenName: string,
  eventProperties: EventProperties = {}
): void => {
  const analytics = useAnalytics();
  const { chainStore, priceStore, accountStore } = useStore();

  const currentChainInfo = chainStore.getChain(chainStore.current.chainId);
  const defaultAccountInfo = accountStore.getAccount("cosmoshub-4");

  useEffect(() => {
    if (analytics.isInitialized) {
      eventProperties.currentChainId = currentChainInfo.chainId;
      eventProperties.currentChainName = currentChainInfo.chainName;

      if (eventProperties.chainId) {
        eventProperties.chainName = chainStore.getChain(
          eventProperties.chainId
        ).chainName;
      }
      if (eventProperties.toChainId) {
        eventProperties.toChainName = chainStore.getChain(
          eventProperties.toChainId
        ).chainName;
      }

      analytics.setUserId(defaultAccountInfo.bech32Address);
      analytics.setUserProperties({
        currency: priceStore.defaultVsCurrency,
      });
      analytics.logScreenView(screenName, eventProperties);
    }
  }, [screenName, analytics.isInitialized]);
};
