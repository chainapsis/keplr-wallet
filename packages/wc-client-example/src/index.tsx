// eslint-disable-next-line import/no-extraneous-dependencies
import "regenerator-runtime/runtime";

import ReactDOM from "react-dom";
import React from "react";
import { App } from "./app";
import { getKeplrFromWindow } from "@keplr-wallet/stores";

getKeplrFromWindow().then(() => {
  ReactDOM.render(<App />, document.getElementById("root"));
});
