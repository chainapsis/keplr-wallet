// Shim ------------
require("setimmediate");
// Shim ------------

import React from "react";
import ReactDOM from "react-dom";

import { HashRouter, Route } from "react-router-dom";

import { RegisterPage } from "./renewal/pages/register";

ReactDOM.render(
  <HashRouter>
    <Route exact path="/register" component={RegisterPage} />
  </HashRouter>,
  document.getElementById("app")
);
