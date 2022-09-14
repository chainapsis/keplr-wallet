import { messages } from "@obi-wallet/common";
import { NavigationContainer } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";
import { IntlProvider } from "react-intl";
import { AppState, StatusBar } from "react-native";
import codePush from "react-native-code-push";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { rootStore } from "../background/root-store";
import { deploymentKey } from "./code-push";
import { Loader } from "./loader";
import { ReceiveScreen } from "./screens/receive";
import { SendScreen } from "./screens/send";
import { settingsScreens } from "./screens/settings";
import { StateRendererScreen } from "./screens/state-renderer";
import { WebViewScreen } from "./screens/web-view";
import { Stack } from "./stack";
import { StoreContext } from "./stores";

export function App() {
  const [updating, setUpdating] = useState(false);
  const appState = useRef(AppState.currentState);
  const lastUpdate = useRef(0);

  useEffect(() => {
    const listener = AppState.addEventListener(
      "change",
      async (nextAppState) => {
        if (
          appState.current.match(/inactive|background|unknown/) &&
          nextAppState === "active"
        ) {
          const timeSinceLastUpdate = new Date().getTime() - lastUpdate.current;
          if (timeSinceLastUpdate > 5 * 1000 && !__DEV__) {
            if (await codePush.checkForUpdate(deploymentKey)) {
              await setUpdating(true);
              await codePush.sync({
                deploymentKey,
                installMode: codePush.InstallMode.IMMEDIATE,
              });
              await setUpdating(false);
            }
          }

          lastUpdate.current = new Date().getTime();
        }

        appState.current = nextAppState;
      }
    );
    return () => {
      listener.remove();
    };
  }, []);

  return (
    <StoreContext.Provider value={rootStore}>
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
          {updating ? (
            <Loader
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                zIndex: 999,
                position: "absolute",
                backgroundColor: "#100F1D",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
              loadingText="Updating app bundle…"
            />
          ) : null}
        </SafeAreaProvider>
      </IntlProvider>
    </StoreContext.Provider>
  );
}
