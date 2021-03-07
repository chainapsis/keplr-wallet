import React, { FunctionComponent } from "react";
import { Text, View } from "react-native";
import { KeyRingStatus } from "@keplr-wallet/background";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useStore } from "./stores";
import { observer } from "mobx-react-lite";
import { RegisterScreen } from "./screens/register";
import { MainScreen } from "./screens/main";

const SplashScreen: FunctionComponent = () => {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Loading...</Text>
    </View>
  );
};

const Stack = createStackNavigator();

export const AppNavigation: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();

  return (
    <React.Fragment>
      <NavigationContainer>
        {keyRingStore.status === KeyRingStatus.NOTLOADED ? (
          <SplashScreen />
        ) : (
          <Stack.Navigator
            initialRouteName={
              keyRingStore.status === KeyRingStatus.EMPTY ? "Register" : "Main"
            }
          >
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Main" component={MainScreen} />
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </React.Fragment>
  );
});
