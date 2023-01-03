// Shim ------------
require("setimmediate");
// Shim ------------

import React, { FunctionComponent } from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route } from "react-router-dom";
import { RegisterPage } from "./renewal/pages/register";
import { StoreProvider } from "./stores";
import { AppIntlProvider } from "./languages";
import { AdditionalIntlMessages, LanguageToFiatCurrency } from "./config.ui";
import { GlobalStyle } from "./renewal/styles";

const App: FunctionComponent = () => {
  return (
    <StoreProvider>
      <AppIntlProvider
        additionalMessages={AdditionalIntlMessages}
        languageToFiatCurrency={LanguageToFiatCurrency}
      >
        <React.Fragment>
          <GlobalStyle />
          <HashRouter>
            <Route exact path="/register" component={RegisterPage} />
          </HashRouter>
        </React.Fragment>
      </AppIntlProvider>
    </StoreProvider>
  );
};

ReactDOM.render(<App />, document.getElementById("app"));
