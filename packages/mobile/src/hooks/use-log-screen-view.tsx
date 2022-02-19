import { useEffect } from "react";
import { EventProperties } from "@keplr-wallet/analytics";
import { useStore } from "../stores";

export const useLogScreenView = (
  screenName: string,
  eventProperties: EventProperties = {}
): void => {
  const { chainStore, priceStore, accountStore, analyticsStore } = useStore();

  const currentChainInfo = chainStore.getChain(chainStore.current.chainId);
  const defaultAccountInfo = accountStore.getAccount("cosmoshub-4");

  useEffect(() => {
    if (analyticsStore.isInitialized) {
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

      analyticsStore.setUserId(defaultAccountInfo.bech32Address);
      analyticsStore.setUserProperties({
        currency: priceStore.defaultVsCurrency,
      });
      analyticsStore.logScreenView(screenName, eventProperties);
    }
  }, [screenName, analyticsStore.isInitialized]);
};
