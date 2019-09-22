import React from "react";
import ReactDOM from "react-dom";

import "./styles/global.scss";
import "purecss/build/pure.css";

import { HashRouter, Route } from "react-router-dom";
import { LockPage } from "./pages/lock";
import { RegisterPage } from "./pages/register";
import { MainPage } from "./pages/main";

import { configure } from "mobx";

import { StoreProvider } from "./stores";
import { KeyRing } from "./stores/keyring";

configure({
  enforceActions: "always" // Make mobx to strict mode.
});

const keyRing = new KeyRing("");
keyRing.restore();

ReactDOM.render(
  <StoreProvider keyRing={keyRing}>
    <HashRouter>
      <Route exact path="/" component={LockPage} />
      <Route path="/main" component={MainPage} />
      <Route path="/register" component={RegisterPage} />
    </HashRouter>
  </StoreProvider>,
  document.getElementById("app")
);
