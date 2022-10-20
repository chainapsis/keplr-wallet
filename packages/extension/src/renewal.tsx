// Shim ------------
require("setimmediate");
// Shim ------------

import React, { FunctionComponent } from "react";
import ReactDOM from "react-dom";
import { Normalize } from "styled-normalize";
import { HashRouter, Route } from "react-router-dom";

import { RegisterPage } from "./renewal/pages/register";
import { StoreProvider } from "./stores";
import { GlobalStyles } from "./renewal/styles";

const App: FunctionComponent = () => {
  return (
    <StoreProvider>
      <React.Fragment>
        <GlobalStyles />
        <Normalize />
        <HashRouter>
          <Route exact path="/register" component={RegisterPage} />
        </HashRouter>
      </React.Fragment>
    </StoreProvider>
  );
};

ReactDOM.render(<App />, document.getElementById("app"));
