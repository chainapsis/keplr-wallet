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

import React, {
  FunctionComponent,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { SettingGeneralAuthZPage } from "./pages/setting/general/authz";
import { SettingGeneralAuthZRevokePage } from "./pages/setting/general/authz/revoke";
import { SettingGeneralDeleteSuggestChainPage } from "./pages/setting/general/delete-suggest-chain";
import { SettingAdvancedPage } from "./pages/setting/advanced";
import { SettingSecurityPage } from "./pages/setting/security";
import { SettingSecurityPermissionPage } from "./pages/setting/security/permission";
import { PermissionPage } from "./pages/permission";
import { SignCosmosTxPage, SignCosmosADR36Page } from "./pages/sign/cosmos";
import { SettingTokenListPage } from "./pages/setting/token/manage";
import { SettingTokenAddPage } from "./pages/setting/token/add";
import { SettingGeneralLanguagePage } from "./pages/setting/general/language";
import { SettingAdvancedEndpointPage } from "./pages/setting/advanced/endpoint";
import { SettingGeneralLinkKeplrMobilePage } from "./pages/setting/general/link-keplr-mobile";
import { SettingContactsList } from "./pages/setting/contacts/list";
import { SettingContactsAdd } from "./pages/setting/contacts/add";
import { SendAmountPage } from "./pages/send/amount";
import { SendSelectAssetPage } from "./pages/send/select-asset";
import {
  WalletSelectPage,
  WalletChangeNamePage,
  WalletDeletePage,
  WalletShowSensitivePage,
} from "./pages/wallet";
import { SuggestChainPage } from "./pages/suggest-chain";
import { ModalRootProvider } from "./components/modal";
import { ConfirmProvider } from "./hooks/confirm";
import { NotificationProvider } from "./hooks/notification";
import { SettingSecurityChangePasswordPage } from "./pages/setting/security/change-password";
import { AppIntlProvider } from "./languages";
import { SettingSecurityAutoLockPage } from "./pages/setting/security/auto-lock";

configure({
  enforceActions: "always", // Make mobx to strict mode.
});

window.keplr = new Keplr(
  manifest.version,
  "core",
  new InExtensionMessageRequester()
);

const useIsURLUnlockPage = () => {
  const [value, setValue] = useState(() => {
    return (
      window.location.hash === "#/unlock" ||
      window.location.hash.startsWith("#/unlock?")
    );
  });

  useLayoutEffect(() => {
    const handler = () => {
      const v =
        window.location.hash === "#/unlock" ||
        window.location.hash.startsWith("#/unlock?");

      setValue(v);
    };

    window.addEventListener("locationchange", handler);

    return () => {
      window.removeEventListener("locationchange", handler);
    };
  }, []);

  return value;
};

const RoutesAfterReady: FunctionComponent = observer(() => {
  const {
    chainStore,
    accountStore,
    keyRingStore,
    ibcCurrencyRegistrar,
    priceStore,
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

  const isURLUnlockPage = useIsURLUnlockPage();
  const openRegisterOnce = useRef(false);

  const isReady = useMemo(() => {
    if (keyRingStore.status === "not-loaded") {
      return false;
    }

    if (keyRingStore.status === "empty") {
      if (!openRegisterOnce.current) {
        openRegisterOnce.current = true;
        browser.tabs
          .create({
            url: "/register.html#",
          })
          .then(() => {
            window.close();
          });
      }

      return false;
    }

    if (chainStore.isInitializing) {
      return false;
    }

    if (isURLUnlockPage) {
      return true;
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

    if (!priceStore.isInitialized) {
      return false;
    }

    if (!uiConfigStore.isInitialized) {
      return false;
    }

    return true;
  }, [
    keyRingStore.status,
    chainStore.isInitializing,
    chainStore.chainInfos,
    isURLUnlockPage,
    ibcCurrencyRegistrar.isInitialized,
    priceStore.isInitialized,
    uiConfigStore.isInitialized,
    accountStore,
  ]);

  return (
    <AppIntlProvider>
      <HashRouter>
        {isReady ? (
          keyRingStore.status === "locked" && !isURLUnlockPage ? (
            <UnlockPage />
          ) : (
            <Routes>
              <Route path="/unlock" element={<UnlockPage />} />
              <Route path="/" element={<MainPage />} />
              <Route path="/send" element={<SendAmountPage />} />
              <Route
                path="/send/select-asset"
                element={<SendSelectAssetPage />}
              />
              <Route path="/setting" element={<SettingPage />} />
              <Route path="/setting/general" element={<SettingGeneralPage />} />
              <Route
                path="/setting/general/language"
                element={<SettingGeneralLanguagePage />}
              />
              <Route
                path="/setting/general/fiat"
                element={<SettingGeneralFiatPage />}
              />
              <Route
                path="/setting/general/authz"
                element={<SettingGeneralAuthZPage />}
              />
              <Route
                path="/setting/general/authz/revoke"
                element={<SettingGeneralAuthZRevokePage />}
              />
              <Route
                path="/setting/general/link-keplr-mobile"
                element={<SettingGeneralLinkKeplrMobilePage />}
              />
              <Route
                path="setting/general/delete-suggest-chain"
                element={<SettingGeneralDeleteSuggestChainPage />}
              />
              <Route
                path="/setting/advanced"
                element={<SettingAdvancedPage />}
              />
              <Route
                path="/setting/advanced/endpoint"
                element={<SettingAdvancedEndpointPage />}
              />
              <Route
                path="/setting/security"
                element={<SettingSecurityPage />}
              />
              <Route
                path="/setting/security/permission"
                element={<SettingSecurityPermissionPage />}
              />
              <Route
                path="/setting/security/auto-lock"
                element={<SettingSecurityAutoLockPage />}
              />
              <Route
                path="/setting/security/change-password"
                element={<SettingSecurityChangePasswordPage />}
              />
              <Route
                path="/setting/token/list"
                element={<SettingTokenListPage />}
              />
              <Route
                path="/setting/token/add"
                element={<SettingTokenAddPage />}
              />
              <Route
                path="/setting/contacts/list"
                element={<SettingContactsList />}
              />
              <Route
                path="/setting/contacts/add"
                element={<SettingContactsAdd />}
              />
              <Route path="/permission" element={<PermissionPage />} />
              <Route path="/sign-cosmos" element={<SignCosmosTxPage />} />
              <Route
                path="/sign-cosmos-adr36"
                element={<SignCosmosADR36Page />}
              />
              <Route path="/wallet/select" element={<WalletSelectPage />} />
              <Route path="/wallet/delete" element={<WalletDeletePage />} />
              <Route
                path="/wallet/change-name"
                element={<WalletChangeNamePage />}
              />
              <Route
                path="/wallet/show-sensitive"
                element={<WalletShowSensitivePage />}
              />
              <Route path="/suggest-chain" element={<SuggestChainPage />} />
            </Routes>
          )
        ) : (
          <div>TODO: Add preparing view</div>
        )}
      </HashRouter>
    </AppIntlProvider>
  );
});

const App: FunctionComponent = () => {
  return (
    <StoreProvider>
      <ModalRootProvider>
        <ConfirmProvider>
          <NotificationProvider>
            <GlobalStyle />
            <GlobalPopupStyle />
            <RoutesAfterReady />
          </NotificationProvider>
        </ConfirmProvider>
      </ModalRootProvider>
    </StoreProvider>
  );
};

ReactDOM.render(<App />, document.getElementById("app"));
