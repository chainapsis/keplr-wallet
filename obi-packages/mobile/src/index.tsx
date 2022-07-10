import { messages } from "@obi-wallet/components";
import React from "react";
import { IntlProvider } from "react-intl";
import { SafeAreaView, StatusBar, useColorScheme } from "react-native";
import { Colors } from "react-native/Libraries/NewAppScreen";

import { HomeScreen } from "./screens/home";

export const App = () => {
  const isDarkMode = useColorScheme() === "dark";

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <IntlProvider
        locale="en"
        messages={messages["en"]}
        formats={{
          date: {
            en: {
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
        <HomeScreen />
      </IntlProvider>
    </SafeAreaView>
  );
};
