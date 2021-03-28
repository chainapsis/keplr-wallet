import React, { FunctionComponent } from "react";
import { Text, View } from "react-native";
import { KeyRingStatus } from "@keplr-wallet/background";
import { NavigationContainer } from "@react-navigation/native";
import { useStore } from "./stores";
import { observer } from "mobx-react-lite";
import { RegisterScreen } from "./screens/register";
import { HomeScreen } from "./screens/home";
import { ModalsRenderer } from "./modals";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";

const SplashScreen: FunctionComponent = () => {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Loading...</Text>
    </View>
  );
};

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

export const MainTabNavigation: FunctionComponent = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
    </Tab.Navigator>
  );
};

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
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="Main" component={MainTabNavigation} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </Stack.Navigator>
        )}
      </NavigationContainer>
      <ModalsRenderer />
    </React.Fragment>
  );
});
