import React, { FunctionComponent } from "react";
import { StoreProvider } from "./stores";
import { AppNavigation } from "./navigation";
import { GlobalThemeProvider } from "./global-theme";
import {
  NotificationProvider,
  NotificationStoreProvider,
} from "./components/notification";
import { LoadingIndicatorProvider } from "./components/loading-indicator";

import codePush from "react-native-code-push";

export const App: FunctionComponent = codePush(() => {
  return (
    <GlobalThemeProvider>
      <StoreProvider>
        <LoadingIndicatorProvider>
          <NotificationStoreProvider>
            <NotificationProvider>
              <AppNavigation />
            </NotificationProvider>
          </NotificationStoreProvider>
        </LoadingIndicatorProvider>
      </StoreProvider>
    </GlobalThemeProvider>
  );
});
