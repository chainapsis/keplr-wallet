import { EventProperties } from "../stores/analytics";
import { useStore } from "../stores";

import { useEffect } from "react";

export const useLogScreenView = (
  screenName: string,
  eventProperties?: EventProperties
): void => {
  const { chainStore, analyticsStore } = useStore();

  useEffect(() => {
    if (analyticsStore.isInitialized) {
      if (eventProperties && eventProperties.chainId) {
        const { chainId } = eventProperties;
        const chainInfo = chainStore.getChain(chainId);
        eventProperties.chainName = chainInfo.chainName;
      }
      analyticsStore.logScreenView(screenName, eventProperties);
    }
  }, [analyticsStore.isInitialized]);
};
