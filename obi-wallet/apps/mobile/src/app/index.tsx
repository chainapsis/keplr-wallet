import { isMultisigDemoWallet, Text, WalletState } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import { AppState, View } from "react-native";
import codePush from "react-native-code-push";

import { deploymentKey } from "./code-push";
import { Loader } from "./loader";
import { Modals } from "./modals";
import { Provider } from "./provider";
import { RootStack } from "./root-stack";
import { HomeScreen } from "./screens/home";
import { MigrateScreen } from "./screens/migrate";
import { MultisigPhoneNumber } from "./screens/onboarding/common/1-phone-number";
import { MultisigPhoneNumberConfirm } from "./screens/onboarding/common/2-phone-number-confirm";
import { MultisigBiometrics } from "./screens/onboarding/common/3-biometrics";
import { MultisigSocial } from "./screens/onboarding/common/4-social";
import { MultisigInit } from "./screens/onboarding/create-multisig-init";
import { LookupProxyWallets } from "./screens/onboarding/lookup-proxy-wallets";
import { RecoverMultisig } from "./screens/onboarding/recover-multisig";
import { RecoverSinglesig } from "./screens/onboarding/recover-singlesig";
import { ReplaceMultisig } from "./screens/onboarding/replace-multisig-key";
import { Welcome } from "./screens/onboarding/welcome";
import { ReceiveScreen } from "./screens/receive";
import { SendScreen } from "./screens/send";
import { settingsScreens } from "./screens/settings";
import { SplashScreen } from "./screens/splash";
import { WebViewScreen } from "./screens/web-view";
import { useStore } from "./stores";

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
      <DemoModeHeader />
      <StateRenderer />
      <Modals />
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

export const DemoModeHeader = observer(() => {
  const { walletsStore } = useStore();

  if (!isMultisigDemoWallet(walletsStore.currentWallet)) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: 20,
        left: "40%",
        right: "40%",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
      }}
    >
      <Text
        style={{
          color: "#fff",
        }}
      >
        Demo
      </Text>
    </View>
  );
});

export const StateRenderer = observer(function StateRenderer() {
  const { walletsStore } = useStore();

  switch (walletsStore.state) {
    case WalletState.LOADING:
      return <SplashScreen />;
    case WalletState.INVALID:
      // TODO: Here we want to show some kind of error screen.
      return null;
    case WalletState.READY: {
      return (
        <RootStack.Navigator
          screenOptions={{
            headerShown: false,
            headerTitleStyle: {
              fontFamily: "Inter",
            },
          }}
        >
          {getScreens()}
        </RootStack.Navigator>
      );
    }
  }

  function getScreens() {
    if (walletsStore.currentWallet?.isReady) {
      return (
        <RootStack.Group>
          <RootStack.Screen name="home" component={HomeScreen} />
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
        </RootStack.Group>
      );
    } else {
      return (
        <RootStack.Group
          screenOptions={{
            headerShown: false,
          }}
        >
          <RootStack.Screen name="welcome" component={Welcome} />
          <RootStack.Screen
            name="create-multisig-biometrics"
            component={MultisigBiometrics}
          />
          <RootStack.Screen
            name="create-multisig-phone-number"
            component={MultisigPhoneNumber}
          />
          <RootStack.Screen
            name="create-multisig-phone-number-confirm"
            component={MultisigPhoneNumberConfirm}
          />
          <RootStack.Screen
            name="create-multisig-social"
            component={MultisigSocial}
          />
          <RootStack.Screen
            name="create-multisig-init"
            component={MultisigInit}
          />
          <RootStack.Screen
            name="replace-multisig"
            component={ReplaceMultisig}
          />
          <RootStack.Screen
            name="recover-multisig"
            component={RecoverMultisig}
          />
          <RootStack.Screen
            name="recover-singlesig"
            component={RecoverSinglesig}
          />
          <RootStack.Screen
            name="lookup-proxy-wallets"
            component={LookupProxyWallets}
          />
        </RootStack.Group>
      );
    }
  }
});
