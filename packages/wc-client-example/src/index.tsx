// eslint-disable-next-line import/no-extraneous-dependencies
import "regenerator-runtime/runtime";

import ReactDOM from "react-dom";
import { StoreProvider } from "./stores";
import React from "react";
import { App } from "./app";

ReactDOM.render(
  <StoreProvider>
    <App />
  </StoreProvider>,
  document.getElementById("root")
);
