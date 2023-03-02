// Shim ------------
require("setimmediate");
// Shim ------------

// Make sure that icon file will be included in bundle
require("./public/assets/logo-256.png");
require("./public/assets/icon/icon-16.png");
require("./public/assets/icon/icon-48.png");
require("./public/assets/icon/icon-128.png");
require("./public/assets/logo-beta-256.png");
require("./public/assets/icon/icon-beta-16.png");
require("./public/assets/icon/icon-beta-48.png");
require("./public/assets/icon/icon-beta-128.png");

import React, { FunctionComponent, useMemo } from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route, Routes } from "react-router-dom";
import { StoreProvider, useStore } from "./stores";
import { GlobalStyle, GlobalPopupStyle } from "./styles";
import { configure } from "mobx";
import { observer } from "mobx-react-lite";
import { Keplr } from "@keplr-wallet/provider";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import manifest from "./manifest.json";
import { WalletStatus } from "@keplr-wallet/stores";
import { UnlockPage } from "./pages/unlock";
import { MainPage } from "./pages/main";

configure({
  enforceActions: "always", // Make mobx to strict mode.
});

window.keplr = new Keplr(
  manifest.version,
  "core",
  new InExtensionMessageRequester()
);

const RoutesAfterReady: FunctionComponent = observer(() => {
  const { chainStore, accountStore, keyRingStore, ibcCurrencyRegistrar } =
    useStore();

  const isReady = useMemo(() => {
    if (keyRingStore.status === "not-loaded") {
      return false;
    }

    if (keyRingStore.status === "empty") {
      browser.tabs
        .create({
          url: "/register.html#",
        })
        .then(() => {
          window.close();
        });

      return false;
    }

    if (chainStore.isInitializing) {
      return false;
    }

    if (keyRingStore.status === "unlocked") {
      // XXX: Below logic not observe state changes on account store and it's inner state.
      //      This is intended because this logic is only for the first time and avoid global re-rendering.
      // Start init for registered chains so that users can see account address more quickly.
      for (const chainInfo of chainStore.chainInfos) {
        const account = accountStore.getAccount(chainInfo.chainId);
        // Because {autoInit: true} is given as the option on account store,
        // initialization for the account starts at this time just by using getAccount().
        // However, run safe check on current status and init if status is not inited.
        if (account.walletStatus === WalletStatus.NotInit) {
          account.init();
        }
      }
    }

    if (!ibcCurrencyRegistrar.isInitialized) {
      return false;
    }

    return true;
  }, [
    accountStore,
    chainStore.chainInfos,
    chainStore.isInitializing,
    ibcCurrencyRegistrar.isInitialized,
    keyRingStore.status,
  ]);

  return (
    <HashRouter>
      {isReady ? (
        keyRingStore.status === "locked" ? (
          <UnlockPage />
        ) : (
          <Routes>
            {/* TODO: Add routes here */}
            <Route path="/" element={<MainPage />} />
          </Routes>
        )
      ) : (
        <div>TODO: Add preparing view</div>
      )}
    </HashRouter>
  );
});

const App: FunctionComponent = () => {
  return (
    <StoreProvider>
      <GlobalStyle />
      <GlobalPopupStyle />
      <RoutesAfterReady />
    </StoreProvider>
  );
};

ReactDOM.render(<App />, document.getElementById("app"));
