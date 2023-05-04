// Shim ------------
require("setimmediate");
// Shim ------------

import React, { FunctionComponent } from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route, Routes } from "react-router-dom";
import { StoreProvider } from "./stores";
import { GlobalStyle } from "./styles";
import { Keplr } from "@keplr-wallet/provider";
import manifest from "./manifest.json";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { configure } from "mobx";
import { ModalRootProvider } from "./components/modal";
import { ConfirmProvider } from "./hooks/confirm";

import { RegisterPage } from "./pages/register";
import { WelcomePage } from "./pages/register/pages/welcome";

configure({
  enforceActions: "always", // Make mobx to strict mode.
});

window.keplr = new Keplr(
  manifest.version,
  "core",
  new InExtensionMessageRequester()
);

const App: FunctionComponent = () => {
  return (
    <StoreProvider>
      <ModalRootProvider>
        <ConfirmProvider>
          <GlobalStyle />
          <HashRouter>
            <Routes>
              <Route path="/" element={<RegisterPage />} />
              <Route path="/welcome" element={<WelcomePage />} />
            </Routes>
          </HashRouter>
        </ConfirmProvider>
      </ModalRootProvider>
    </StoreProvider>
  );
};

ReactDOM.render(<App />, document.getElementById("app"));
