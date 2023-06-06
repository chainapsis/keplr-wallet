import React, { FunctionComponent, useEffect, useState } from "react";

import { createRootStore, RootStore } from "./root";
import { getKeplrFromWindow } from "@keplr-wallet/stores";
import { Keplr } from "@keplr-wallet/types";

interface KeplrCoreTypes {
  __core__getAnalyticsId(): Promise<string>;
}

const storeContext = React.createContext<RootStore | null>(null);

export const StoreProvider: FunctionComponent = ({ children }) => {
  const [stores] = useState(() => createRootStore());

  useEffect(() => {
    getKeplrFromWindow().then(
      (keplr: (Keplr & Partial<KeplrCoreTypes>) | undefined) => {
        // Remember that `KeplrCoreTypes` is only usable on privileged env.
        // Definitely, extension is privileged env. So, we can use `getAnalyticsId()`.
        if (keplr && keplr.__core__getAnalyticsId) {
          keplr.__core__getAnalyticsId().then((id) => {
            stores.analyticsStore.setUserId(id);
          });
        }
      }
    );
  }, [stores.analyticsStore]);

  useEffect(() => {
    if (!stores.keyRingStore.isInitialized) {
      return;
    }

    if (!stores.uiConfigStore.isInitialized) {
      return;
    }

    stores.analyticsStore.setUserProperties({
      accountCount: stores.keyRingStore.keyInfos.length,
      isDeveloperMode: stores.uiConfigStore.isDeveloper,
    });
  }, [
    stores.analyticsStore,
    stores.keyRingStore.isInitialized,
    stores.keyRingStore.keyInfos.length,
    stores.uiConfigStore.isDeveloper,
    stores.uiConfigStore.isInitialized,
  ]);

  return (
    <storeContext.Provider value={stores}>{children}</storeContext.Provider>
  );
};

export const useStore = () => {
  const store = React.useContext(storeContext);
  if (!store) {
    throw new Error("You have forgot to use StoreProvider");
  }
  return store;
};

export { ChainStore } from "./chain";
