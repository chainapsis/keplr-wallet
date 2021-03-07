import React, { FunctionComponent } from "react";
import { StoreProvider } from "./stores";
import { AppNavigation } from "./navigation";

export const App: FunctionComponent = () => {
  return (
    <StoreProvider>
      <AppNavigation />
    </StoreProvider>
  );
};
