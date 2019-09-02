import React from "react";
import ReactDOM from "react-dom";

import "./styles/global.scss";
import "purecss/build/pure.css";

import MainPage from "./pages/main";

import { configure } from "mobx";

import { StoreProvider } from "./stores";
import { KeyRing } from "./stores/keyring";

configure({
  enforceActions: "always" // Make mobx to strict mode.
});

const keyRing = new KeyRing(
  "sugar drill peanut defy impose dune damage someone mimic volcano sorry arrow exotic ostrich blush train person pizza bundle elegant also attend clinic fiscal"
);

ReactDOM.render(
  <StoreProvider keyRing={keyRing}>
    <MainPage />
  </StoreProvider>,
  document.getElementById("app")
);
