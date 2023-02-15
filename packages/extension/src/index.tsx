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

import React, { FunctionComponent } from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route, Routes } from "react-router-dom";
import { RegisterPage } from "./pages/register";
import { StoreProvider } from "./stores";
import { GlobalStyle } from "./styles";

const App: FunctionComponent = () => {
  return (
    <StoreProvider>
      <GlobalStyle />
      <HashRouter>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </HashRouter>
    </StoreProvider>
  );
};

ReactDOM.render(<App />, document.getElementById("app"));
