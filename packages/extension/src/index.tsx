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

import React, { FunctionComponent, useEffect, useMemo } from "react";
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
import { StartAutoLockMonitoringMsg } from "@keplr-wallet/background";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import { SettingPage } from "./pages/setting";
import { SettingGeneralPage } from "./pages/setting/general";
import { SettingGeneralFiatPage } from "./pages/setting/general/fiat";
import { SettingSecurityPage } from "./pages/setting/security";
import { SettingSecurityPermissionPage } from "./pages/setting/security/permission";
import { PermissionPage } from "./pages/permission";
import { SignCosmosTxPage, SignCosmosADR36Page } from "./pages/sign/cosmos";
import { SendPage } from "./pages/send";

configure({
  enforceActions: "always", // Make mobx to strict mode.
});

window.keplr = new Keplr(
  manifest.version,
  "core",
  new InExtensionMessageRequester()
);

const RoutesAfterReady: FunctionComponent = observer(() => {
  const {
    chainStore,
    accountStore,
    keyRingStore,
    ibcCurrencyRegistrar,
    uiConfigStore,
  } = useStore();

  useEffect(() => {
    if (keyRingStore.status === "unlocked") {
      const sendAutoLockMonitorMsg = async () => {
        const msg = new StartAutoLockMonitoringMsg();
        const requester = new InExtensionMessageRequester();
        await requester.sendMessage(BACKGROUND_PORT, msg);
      };

      // Notify to auto lock service to start activation check whenever the keyring is unlocked.
      sendAutoLockMonitorMsg();
      const autoLockInterval = setInterval(() => {
        sendAutoLockMonitorMsg();
      }, 10000);

      return () => {
        clearInterval(autoLockInterval);
      };
    }
  }, [keyRingStore.status]);

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

    if (!uiConfigStore.isInitialized) {
      return false;
    }

    return true;
  }, [
    accountStore,
    chainStore.chainInfos,
    chainStore.isInitializing,
    ibcCurrencyRegistrar.isInitialized,
    uiConfigStore.isInitialized,
    keyRingStore.status,
  ]);

  return (
    <HashRouter>
      {isReady ? (
        keyRingStore.status === "locked" ? (
          <UnlockPage />
        ) : (
          <Routes>
            {/*
              XXX: There is no need to register unlock page even though permission interaction service
                   interacts with "/unlock" url because it can be handled by above `keyRingStore.status === "locked"" case.
              <Route path="/unlock" element={<UnlockPage />} />
             */}
            <Route path="/" element={<MainPage />} />
            <Route path="/send" element={<SendPage />} />
            <Route path="/setting" element={<SettingPage />} />
            <Route path="/setting/general" element={<SettingGeneralPage />} />
            <Route
              path="/setting/general/fiat"
              element={<SettingGeneralFiatPage />}
            />
            <Route path="/setting/security" element={<SettingSecurityPage />} />
            <Route
              path="/setting/security/permission"
              element={<SettingSecurityPermissionPage />}
            />
            <Route path="/permission" element={<PermissionPage />} />
            <Route path="/sign-cosmos" element={<SignCosmosTxPage />} />
            <Route
              path="/sign-cosmos-adr36"
              element={<SignCosmosADR36Page />}
            />
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
