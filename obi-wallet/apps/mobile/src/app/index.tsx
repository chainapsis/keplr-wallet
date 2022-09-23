import { useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import codePush from "react-native-code-push";

import { deploymentKey } from "./code-push";
import { Loader } from "./loader";
import { Provider } from "./provider";
import { RootStack } from "./root-stack";
import { MigrateScreen } from "./screens/migrate";
import { ReceiveScreen } from "./screens/receive";
import { SendScreen } from "./screens/send";
import { settingsScreens } from "./screens/settings";
import { StateRendererScreen } from "./screens/state-renderer";
import { WebViewScreen } from "./screens/web-view";

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
              try {
                await setUpdating(true);
                await codePush.sync({
                  deploymentKey,
                  installMode: codePush.InstallMode.IMMEDIATE,
                });
              } catch (e) {
                console.error(e);
                await setUpdating(false);
              }
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
    <Provider>
      <RootStack.Navigator
        initialRouteName="state-renderer"
        screenOptions={{
          headerShown: false,
          headerTitleStyle: {
            fontFamily: "Inter",
          },
        }}
      >
        <RootStack.Screen
          name="state-renderer"
          component={StateRendererScreen}
        />
        <RootStack.Screen
          name="web-view"
          component={WebViewScreen}
          options={({ route }) => ({
            title: route.params.app.label,
          })}
        />
        <RootStack.Screen name="send" component={SendScreen} />
        <RootStack.Screen name="receive" component={ReceiveScreen} />
        <RootStack.Screen name="migrate" component={MigrateScreen} />

        {settingsScreens()}
      </RootStack.Navigator>
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
    </Provider>
  );
}
