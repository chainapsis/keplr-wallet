import React, { FunctionComponent } from "react";
import { StoreProvider } from "./stores";
import { AppNavigation } from "./navigation";
import { GlobalThemeProvider } from "./global-theme";

export const App: FunctionComponent = () => {
  return (
    <GlobalThemeProvider>
      <StoreProvider>
        <AppNavigation />
      </StoreProvider>
    </GlobalThemeProvider>
  );
};
