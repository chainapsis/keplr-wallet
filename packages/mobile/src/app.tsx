import React, { FunctionComponent } from "react";
import { StoreProvider } from "./stores";
import { AppNavigation } from "./navigation";
import { GlobalThemeProvider } from "./global-theme";
import {
  NotificationProvider,
  NotificationStoreProvider,
} from "./components/notification";

export const App: FunctionComponent = () => {
  return (
    <GlobalThemeProvider>
      <StoreProvider>
        <NotificationStoreProvider>
          <NotificationProvider>
            <AppNavigation />
          </NotificationProvider>
        </NotificationStoreProvider>
      </StoreProvider>
    </GlobalThemeProvider>
  );
};
