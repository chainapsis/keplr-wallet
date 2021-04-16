import React, { FunctionComponent } from "react";
import { Text, View } from "react-native";
import { KeyRingStatus } from "@keplr-wallet/background";
import { NavigationContainer } from "@react-navigation/native";
import { useStore } from "./stores";
import { observer } from "mobx-react-lite";
import { RegisterScreen } from "./screens/register";
import { HomeStackScreen } from "./screens/home";
import { ModalsRenderer } from "./modals";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { SendStackScreen } from "./screens/send";
import { StakeStackScreen } from "./screens/stake";
import { GovernanceStackScreen } from "./screens/governance";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { DrawerContent } from "./components/drawer";

const SplashScreen: FunctionComponent = () => {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Loading...</Text>
    </View>
  );
};

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

export const MainTabNavigation: FunctionComponent = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeStackScreen} />
      <Tab.Screen name="Send" component={SendStackScreen} />
      <Tab.Screen name="Stake" component={StakeStackScreen} />
      <Tab.Screen name="Governance" component={GovernanceStackScreen} />
    </Tab.Navigator>
  );
};

export const MainTabNavigationWithDrawer: FunctionComponent = () => {
  return (
    <Drawer.Navigator
      drawerType="slide"
      drawerContent={(props) => <DrawerContent {...props} />}
    >
      <Drawer.Screen name="Main" component={MainTabNavigation} />
    </Drawer.Navigator>
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
            <Stack.Screen name="Main" component={MainTabNavigationWithDrawer} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </Stack.Navigator>
        )}
      </NavigationContainer>
      <ModalsRenderer />
    </React.Fragment>
  );
});
