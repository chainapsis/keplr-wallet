import React, { FunctionComponent } from "react";
import { StoreProvider } from "./stores";
import { StyleProvider } from "./styles";
import { AppNavigation } from "./navigation";
import { GlobalThemeProvider } from "./global-theme";
import {
  NotificationProvider,
  NotificationStoreProvider,
} from "./components/notification";
import { LoadingIndicatorProvider } from "./components/loading-indicator";
import { BioAuthProvider } from "./hooks/bio-auth";
import { IntlProvider } from "react-intl";
import { Platform } from "react-native";

import codePush from "react-native-code-push";

export const App: FunctionComponent = codePush(() => {
  return (
    <GlobalThemeProvider>
      <StyleProvider>
        <StoreProvider>
          <IntlProvider
            locale="en"
            timeZone={
              // I'm not sure that the cause of this problem.
              // But, in android, the intl's local time zone isn't set properly and always set as UTC.
              // To prevent this problem, just set the time zone from localize module if the platform is android.
              Platform.OS === "android"
                ? // eslint-disable-next-line @typescript-eslint/no-var-requires
                  require("react-native-localize").getTimeZone()
                : undefined
            }
            formats={{
              date: {
                en: {
                  // Prefer not showing the year.
                  // If the year is different with current time, recommend to show the year.
                  // However, this recomendation should be handled in the component logic.
                  // year: "numeric",
                  month: "short",
                  day: "2-digit",
                  hour: "2-digit",
                  hour12: false,
                  minute: "2-digit",
                  timeZoneName: "short",
                },
              },
            }}
          >
            <BioAuthProvider>
              <LoadingIndicatorProvider>
                <NotificationStoreProvider>
                  <NotificationProvider>
                    <AppNavigation />
                  </NotificationProvider>
                </NotificationStoreProvider>
              </LoadingIndicatorProvider>
            </BioAuthProvider>
          </IntlProvider>
        </StoreProvider>
      </StyleProvider>
    </GlobalThemeProvider>
  );
});
