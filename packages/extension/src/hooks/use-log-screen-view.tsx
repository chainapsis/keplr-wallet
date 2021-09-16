import { EventProperties } from "../stores/analytics";
import { useStore } from "../stores";
import { useEffect } from "react";
import { useLanguage } from "../languages";

export const useLogScreenView = (
  screenName: string,
  eventProperties?: EventProperties
): void => {
  const { chainStore, analyticsStore } = useStore();
  const language = useLanguage();

  useEffect(() => {
    if (analyticsStore.isInitialized) {
      if (eventProperties && eventProperties.chainId) {
        const { chainId } = eventProperties;
        const chainInfo = chainStore.getChain(chainId);
        eventProperties.chainName = chainInfo.chainName;
      }
      analyticsStore.setUserId();
      analyticsStore.setUserProperties({
        currency: language.fiatCurrency,
        language: language.language,
      });
      analyticsStore.logScreenView(screenName, eventProperties);
    }
  }, [analyticsStore.isInitialized]);
};
