import { messages } from "@obi-wallet/common";
import { NavigationContainer } from "@react-navigation/native";
import { IntlProvider } from "react-intl";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ReceiveScreen } from "./screens/receive";
import { SendScreen } from "./screens/send";
import { settingsScreens } from "./screens/settings";
import { StateRendererScreen } from "./screens/state-renderer";
import { WebViewScreen } from "./screens/web-view";
import { Stack } from "./stack";

export function App() {
  const language = "en";

  return (
    <IntlProvider
      defaultLocale="en"
      locale={language}
      messages={messages[language]}
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
          de: {
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
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar barStyle="light-content" />
          <Stack.Navigator
            initialRouteName="state-renderer"
            screenOptions={{
              headerShown: false,
              headerTitleStyle: {
                fontFamily: "Inter",
              },
            }}
          >
            <Stack.Screen
              name="state-renderer"
              component={StateRendererScreen}
            />
            <Stack.Screen
              name="web-view"
              component={WebViewScreen}
              options={({ route }) => ({
                title: route.params.app.label,
              })}
            />
            <Stack.Screen name="send" component={SendScreen} />
            <Stack.Screen name="receive" component={ReceiveScreen} />

            {settingsScreens()}
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </IntlProvider>
  );
}
