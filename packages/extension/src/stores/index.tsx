import React, { FunctionComponent, useEffect, useState } from "react";

import { createRootStore, RootStore } from "./root";
import { getKeplrFromWindow } from "@keplr-wallet/stores";
import { Keplr } from "@keplr-wallet/types";
import { autorun } from "mobx";
import { PlainObject } from "@keplr-wallet/background";

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
    const disposal = autorun(() => {
      if (!stores.keyRingStore.isInitialized) {
        return;
      }

      if (!stores.uiConfigStore.isInitialized) {
        return;
      }

      const numPerTypes: Record<string, number> = {};
      for (const keyInfo of stores.keyRingStore.keyInfos) {
        let type = keyInfo.insensitive["keyRingType"] as string;
        if (type === "private-key") {
          const meta = keyInfo.insensitive["keyRingMeta"] as PlainObject;
          if (meta["web3Auth"] && (meta["web3Auth"] as any)["type"]) {
            type = "web3_auth_" + (meta["web3Auth"] as any)["type"];
          }
        }

        if (type) {
          type = "keyring_" + type + "_num";

          if (!numPerTypes[type]) {
            numPerTypes[type] = 0;
          }
          numPerTypes[type] += 1;
        }
      }

      let currentKeyRingType: string = "none";
      if (stores.keyRingStore.selectedKeyInfo) {
        currentKeyRingType = stores.keyRingStore.selectedKeyInfo.insensitive[
          "keyRingType"
        ] as string;
        if (currentKeyRingType === "private-key") {
          const meta = stores.keyRingStore.selectedKeyInfo.insensitive[
            "keyRingMeta"
          ] as PlainObject;
          if (meta["web3Auth"] && (meta["web3Auth"] as any)["type"]) {
            currentKeyRingType =
              "web3_auth_" + (meta["web3Auth"] as any)["type"];
          }
        }
      }

      stores.analyticsStore.setUserProperties({
        account_count: stores.keyRingStore.keyInfos.length,
        is_developer_mode: stores.uiConfigStore.isDeveloper,
        current_keyring_type: currentKeyRingType,
        ...numPerTypes,
      });
    });

    return () => {
      if (disposal) {
        disposal();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
