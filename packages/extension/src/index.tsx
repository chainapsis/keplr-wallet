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
import { GlobalStyle } from "./styles";
import { observer } from "mobx-react-lite";

const RoutesAfterReady: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();

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

    return true;
  }, [keyRingStore.status]);

  return (
    <HashRouter>
      {isReady ? (
        <Routes>
          {/* TODO: Add routes here */}
          <Route
            path="/"
            element={
              <div>
                {keyRingStore.keyInfos.map((keyInfo) => {
                  return <div key={keyInfo.id}>{JSON.stringify(keyInfo)}</div>;
                })}
              </div>
            }
          />
        </Routes>
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
      <RoutesAfterReady />
    </StoreProvider>
  );
};

ReactDOM.render(<App />, document.getElementById("app"));
