import React, { FunctionComponent, useEffect, useState } from "react";

import { createRootStore, RootStore } from "./root";
import { getKeplrFromWindow } from "@keplr-wallet/stores";
import { KeplrCoreTypes } from "@keplr-wallet/provider/build/core-types";
import { Keplr } from "@keplr-wallet/types";

const storeContext = React.createContext<RootStore | null>(null);

export const StoreProvider: FunctionComponent = ({ children }) => {
  const [stores] = useState(() => createRootStore());

  useEffect(() => {
    getKeplrFromWindow().then(
      (keplr: (Keplr & Partial<KeplrCoreTypes>) | undefined) => {
        // Remember that `KeplrCoreTypes` is only usable on privileged env.
        // Definitely, extension is privileged env. So, we can use `privileged env`.
        if (keplr && keplr.__core__getAnalyticsId) {
          keplr.__core__getAnalyticsId().then((id) => {
            stores.analyticsStore.setUserId(id);
          });
        }
      }
    );
  }, [stores.analyticsStore]);

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
