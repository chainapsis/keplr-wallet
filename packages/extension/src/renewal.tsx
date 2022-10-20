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
import { AppIntlProvider } from "./languages";
import { AdditonalIntlMessages, LanguageToFiatCurrency } from "./config.ui";

const App: FunctionComponent = () => {
  return (
    <StoreProvider>
      <AppIntlProvider
        additionalMessages={AdditonalIntlMessages}
        languageToFiatCurrency={LanguageToFiatCurrency}
      >
        <React.Fragment>
          <GlobalStyles />
          <Normalize />
          <HashRouter>
            <Route exact path="/register" component={RegisterPage} />
          </HashRouter>
        </React.Fragment>
      </AppIntlProvider>
    </StoreProvider>
  );
};

ReactDOM.render(<App />, document.getElementById("app"));
