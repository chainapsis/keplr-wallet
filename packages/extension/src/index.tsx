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

import { KeyRingStatus } from "@keplr-wallet/background";
import React, { FunctionComponent, useEffect } from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route, Routes } from "react-router-dom";
import { StoreProvider, useStore } from "./stores";
import { GlobalStyle } from "./styles";
import { observer } from "mobx-react-lite";

const StateRoutes: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();

  useEffect(() => {
    console.log(keyRingStore.status);
    if (keyRingStore.status === KeyRingStatus.EMPTY) {
      browser.tabs
        .create({
          url: "/register.html#",
        })
        .then(() => {
          window.close();
        });
    }
  }, [keyRingStore.status]);

  return (
    <HashRouter>
      <Routes>
        {/* TODO: Add routes here */}
        <Route path="/" element={<div />} />
      </Routes>
    </HashRouter>
  );
});

const App: FunctionComponent = () => {
  return (
    <StoreProvider>
      <GlobalStyle />
      <StateRoutes />
    </StoreProvider>
  );
};

ReactDOM.render(<App />, document.getElementById("app"));
