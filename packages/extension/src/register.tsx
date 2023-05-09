// Shim ------------
require("setimmediate");
// Shim ------------

import React, { FunctionComponent, useEffect } from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route, Routes } from "react-router-dom";
import { StoreProvider, useStore } from "./stores";
import { GlobalStyle } from "./styles";
import { Keplr } from "@keplr-wallet/provider";
import manifest from "./manifest.json";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { configure } from "mobx";
import { ModalRootProvider } from "./components/modal";
import { ConfirmProvider } from "./hooks/confirm";
import { RegisterPage } from "./pages/register";
import { WelcomePage } from "./pages/register/pages/welcome";
import { AppIntlProvider } from "./languages";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import { observer } from "mobx-react-lite";
import { StartAutoLockMonitoringMsg } from "@keplr-wallet/background";

configure({
  enforceActions: "always", // Make mobx to strict mode.
});

window.keplr = new Keplr(
  manifest.version,
  "core",
  new InExtensionMessageRequester()
);

const AutoLockMonitor: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();

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

  return null;
});

const App: FunctionComponent = () => {
  return (
    <StoreProvider>
      <ModalRootProvider>
        <ConfirmProvider>
          <GlobalStyle />
          <AutoLockMonitor />
          <AppIntlProvider>
            <HashRouter>
              <Routes>
                <Route path="/" element={<RegisterPage />} />
                <Route path="/welcome" element={<WelcomePage />} />
              </Routes>
            </HashRouter>
          </AppIntlProvider>
        </ConfirmProvider>
      </ModalRootProvider>
    </StoreProvider>
  );
};

ReactDOM.render(<App />, document.getElementById("app"));
