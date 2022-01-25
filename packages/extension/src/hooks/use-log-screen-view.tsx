import { useAnalytics, EventProperties } from "@keplr-wallet/analytics";
import { useStore } from "../stores";
import { useEffect } from "react";
import { useLanguage } from "../languages";

export const useLogScreenView = (
  screenName: string,
  eventProperties: EventProperties = {}
): void => {
  const analytics = useAnalytics();
  const { chainStore, accountStore } = useStore();
  const language = useLanguage();

  const currentChainInfo = chainStore.getChain(chainStore.current.chainId);
  const defaultAccountInfo = accountStore.getAccount("cosmoshub-4");

  useEffect(() => {
    if (analytics.isInitialized) {
      if (eventProperties) {
        eventProperties.chainId = currentChainInfo.chainId;
        eventProperties.chainName = currentChainInfo.chainName;
      }
      analytics.setUserId(defaultAccountInfo.bech32Address);
      analytics.setUserProperties({
        currency: language.fiatCurrency,
        language: language.language,
      });
      analytics.logScreenView(screenName, eventProperties);
    }
  }, [analytics.isInitialized]);
};
