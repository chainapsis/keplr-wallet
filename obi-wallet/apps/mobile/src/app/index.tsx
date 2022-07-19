import { messages } from "@obi-wallet/common";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { IntlProvider } from "react-intl";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { StateRendererScreen } from "./screens/state-renderer";

const Stack = createNativeStackNavigator();

export function App() {
  return (
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
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="state-renderer"
            screenOptions={{
              headerTitleStyle: {
                fontFamily: "Poppins",
              },
            }}
          >
            <Stack.Screen
              name="state-renderer"
              component={StateRendererScreen}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </IntlProvider>
  );
}
