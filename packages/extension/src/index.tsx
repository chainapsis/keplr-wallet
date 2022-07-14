import React, { FunctionComponent } from "react";
import { createRoot } from "react-dom/client";

import { AppIntlProvider } from "./languages";

import "./styles/global.scss";

import { HashRouter, Route, Routes } from "react-router-dom";

import { AccessPage, Secret20ViewingKeyAccessPage } from "./pages/access";
import { HomePage } from "./pages/home";
import { AppStorePage } from "./pages/home/app-store-page";
import { RegisterPage } from "./pages/register";
import { MainPage } from "./pages/main";
import { LockPage } from "./pages/lock";
import { SendPage } from "./pages/send";
import { IBCTransferPage } from "./pages/ibc-transfer";
import { SetKeyRingPage } from "./pages/setting/keyring";

import { Banner } from "./components/banner";

import {
  NotificationProvider,
  NotificationStoreProvider,
} from "./components/notification";
import { ConfirmProvider } from "./components/confirm";
import { LoadingIndicatorProvider } from "./components/loading-indicator";

import { configure } from "mobx";
import { observer } from "mobx-react-lite";

import { StoreProvider, useStore } from "./stores";
import { KeyRingStatus } from "@keplr-wallet/background";
import { SignPage } from "./pages/sign";
import { ChainSuggestedPage } from "./pages/chain/suggest";
import Modal from "react-modal";
import { SettingPage } from "./pages/setting";
import { SettingLanguagePage } from "./pages/setting/language";
import { SettingFiatPage } from "./pages/setting/fiat";
import {
  SettingConnectionsPage,
  SettingSecret20ViewingKeyConnectionsPage,
} from "./pages/setting/connections";
import { AddressBookPage } from "./pages/setting/address-book";
import { CreditPage } from "./pages/setting/credit";
import { ChangeNamePage } from "./pages/setting/keyring/change";
import { ClearPage } from "./pages/setting/clear";
import { ExportPage } from "./pages/setting/export";
import { LedgerGrantPage } from "./pages/ledger";
import { AddTokenPage } from "./pages/setting/token/add";
import { ManageTokenPage } from "./pages/setting/token/manage";

// import * as BackgroundTxResult from "../../background/tx/foreground";

import { AdditonalIntlMessages, LanguageToFiatCurrency } from "./config.ui";

import manifest from "./manifest.json";
import { Keplr } from "@keplr-wallet/provider";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { ExportToMobilePage } from "./pages/setting/export-to-mobile";
import { LogPageViewWrapper } from "./components/analytics";
import { SettingEndpointsPage } from "./pages/setting/endpoints";

window.keplr = new Keplr(
  manifest.version,
  "core",
  new InExtensionMessageRequester()
);

// Make sure that icon file will be included in bundle
require("./public/assets/logo-256.png");
require("./public/assets/icon/icon-16.png");
require("./public/assets/icon/icon-48.png");
require("./public/assets/icon/icon-128.png");

configure({
  enforceActions: "always", // Make mobx to strict mode.
});

Modal.setAppElement("#app");
Modal.defaultStyles = {
  content: {
    ...Modal.defaultStyles.content,
    minWidth: "300px",
    maxWidth: "600px",
    minHeight: "250px",
    maxHeight: "500px",
    left: "50%",
    right: "auto",
    top: "50%",
    bottom: "auto",
    transform: "translate(-50%, -50%)",
  },
  overlay: {
    zIndex: 1000,
    ...Modal.defaultStyles.overlay,
  },
};

const StateRenderer: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();

  if (keyRingStore.status === KeyRingStatus.UNLOCKED) {
    return <MainPage />;
  } else if (keyRingStore.status === KeyRingStatus.LOCKED) {
    return <LockPage />;
  } else if (keyRingStore.status === KeyRingStatus.EMPTY) {
    browser.tabs.create({
      url: "/popup.html#/register",
    });
    window.close();
    return (
      <div style={{ height: "100%" }}>
        <Banner
          icon={require("./public/assets/logo-256.png")}
          logo={require("./public/assets/brand-text.png")}
          subtitle="Wallet for the Interchain"
        />
      </div>
    );
  } else if (keyRingStore.status === KeyRingStatus.NOTLOADED) {
    return (
      <div style={{ height: "100%" }}>
        <Banner
          icon={require("./public/assets/logo-256.png")}
          logo={require("./public/assets/brand-text.png")}
          subtitle="Wallet for the Interchain"
        />
      </div>
    );
  } else {
    return <div>Unknown status</div>;
  }
});

const container = document.getElementById("app");
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);
root.render(
  <StoreProvider>
    <AppIntlProvider
      additionalMessages={AdditonalIntlMessages}
      languageToFiatCurrency={LanguageToFiatCurrency}
    >
      <LoadingIndicatorProvider>
        <NotificationStoreProvider>
          <NotificationProvider>
            <ConfirmProvider>
              <HashRouter>
                <LogPageViewWrapper>
                  <Routes>
                    <Route path="/" element={<StateRenderer />} />
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/home/app-store" element={<AppStorePage />} />
                    <Route path="/unlock" element={<LockPage />} />
                    <Route path="/access" element={<AccessPage />} />
                    <Route
                      path="/access/viewing-key"
                      element={<Secret20ViewingKeyAccessPage />}
                    />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/send" element={<SendPage />} />
                    <Route path="/ibc-transfer" element={<IBCTransferPage />} />
                    <Route path="/setting" element={<SettingPage />} />
                    <Route path="/ledger-grant" element={<LedgerGrantPage />} />
                    <Route
                      path="/setting/language"
                      element={<SettingLanguagePage />}
                    />
                    <Route path="/setting/fiat" element={<SettingFiatPage />} />
                    <Route
                      path="/setting/connections"
                      element={<SettingConnectionsPage />}
                    />
                    <Route
                      path="/setting/connections/viewing-key/:contractAddress"
                      element={<SettingSecret20ViewingKeyConnectionsPage />}
                    />
                    <Route
                      path="/setting/address-book"
                      element={<AddressBookPage />}
                    />
                    <Route
                      path="/setting/child-accounts"
                      element={<AddressBookPage isChildAccounts={true} />}
                    />
                    <Route
                      path="/setting/export-to-mobile"
                      element={<ExportToMobilePage />}
                    />
                    <Route path="/setting/credit" element={<CreditPage />} />
                    <Route
                      path="/setting/set-keyring"
                      element={<SetKeyRingPage />}
                    />
                    <Route
                      path="/setting/export/:index"
                      element={<ExportPage />}
                    />
                    <Route
                      path="/setting/clear/:index"
                      element={<ClearPage />}
                    />
                    <Route
                      path="/setting/keyring/change/name/:index"
                      element={<ChangeNamePage />}
                    />
                    <Route
                      path="/setting/token/add"
                      element={<AddTokenPage />}
                    />
                    <Route
                      path="/setting/token/manage"
                      element={<ManageTokenPage />}
                    />
                    <Route
                      path="/setting/endpoints"
                      element={<SettingEndpointsPage />}
                    />
                    <Route path="/sign" element={<SignPage />} />
                    <Route
                      path="/suggest-chain"
                      element={<ChainSuggestedPage />}
                    />
                  </Routes>
                </LogPageViewWrapper>
              </HashRouter>
            </ConfirmProvider>
          </NotificationProvider>
        </NotificationStoreProvider>
      </LoadingIndicatorProvider>
    </AppIntlProvider>
  </StoreProvider>
);
