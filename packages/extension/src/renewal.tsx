// Shim ------------
require("setimmediate");
// Shim ------------

import React, { FunctionComponent } from "react";
import ReactDOM from "react-dom";
import { Normalize } from "styled-normalize";

import { HashRouter, Route } from "react-router-dom";

import { RegisterPage } from "./renewal/pages/register";

const App: FunctionComponent = () => {
  return (
    <React.Fragment>
      <Normalize />
      <HashRouter>
        <Route exact path="/register" component={RegisterPage} />
      </HashRouter>
    </React.Fragment>
  );
};

ReactDOM.render(<App />, document.getElementById("app"));
