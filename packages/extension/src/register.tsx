// Shim ------------
require("setimmediate");
// Shim ------------

import React, { FunctionComponent } from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route, Routes } from "react-router-dom";
import { RegisterPage } from "./pages/register";
import { StoreProvider } from "./stores";
import { GlobalStyle } from "./styles";
import { Keplr } from "@keplr-wallet/provider";
import manifest from "./manifest.json";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { configure } from "mobx";

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
      <GlobalStyle />
      <HashRouter>
        <Routes>
          <Route path="/" element={<RegisterPage />} />
        </Routes>
      </HashRouter>
    </StoreProvider>
  );
};

ReactDOM.render(<App />, document.getElementById("app"));
