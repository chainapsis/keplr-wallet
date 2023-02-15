// Shim ------------
require("setimmediate");
// Shim ------------

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
          <Route path="/" element={<RegisterPage />} />
        </Routes>
      </HashRouter>
    </StoreProvider>
  );
};

ReactDOM.render(<App />, document.getElementById("app"));
