/* eslint-disable react/display-name */
import React, { FunctionComponent, useEffect, useRef } from "react";
import { Text, View } from "react-native";
import { KeyRingStatus } from "@keplr-wallet/background";
import {
  NavigationContainer,
  useNavigation,
  useRoute,
  getFocusedRouteNameFromRoute,
  NavigationContainerRef,
} from "@react-navigation/native";
import { useStore } from "./stores";
import { observer } from "mobx-react-lite";
import { RegisterStackScreen } from "./screens/register";
import { HomeStackScreen } from "./screens/home";
import { ModalsRenderer } from "./modals";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { SendStackScreen } from "./screens/send";
import { StakeStackScreen } from "./screens/stake";
import { GovernanceStackScreen } from "./screens/governance";
import { SettingStackScreen } from "./screens/setting";
import { createDrawerNavigator } from "@react-navigation/drawer";
import analytics from "@react-native-firebase/analytics";
import Ionicons from "react-native-vector-icons/Ionicons";
import { DrawerContent } from "./components/drawer";
import {
  alignItemsCenter,
  flex1,
  justifyContentCenter,
  sf,
  colors,
} from "./styles";

const SplashScreen: FunctionComponent = () => {
  return (
    <View style={sf([flex1, alignItemsCenter, justifyContentCenter])}>
      <Text>Loading...</Text>
    </View>
  );
};

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

export const MainNavigation: FunctionComponent = () => {
  const navigation = useNavigation();
  const route = useRoute();
  useEffect(() => {
    const routeName = getFocusedRouteNameFromRoute(route);

    if (routeName === "Home" || routeName === undefined) {
      navigation.setOptions({ tabBarVisible: true });
    } else {
      navigation.setOptions({ tabBarVisible: false });
    }
  }, [navigation, route]);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Home" component={HomeStackScreen} />
      <Stack.Screen name="Send" component={SendStackScreen} />
      <Stack.Screen name="Stake" component={StakeStackScreen} />
      <Stack.Screen name="Governance" component={GovernanceStackScreen} />
    </Stack.Navigator>
  );
};

export const MainTabNavigation: FunctionComponent = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = "";

          if (route.name === "Main") {
            iconName = focused ? "ios-grid" : "ios-grid-outline";
          } else if (route.name === "Settings") {
            iconName = focused ? "settings" : "settings-outline";
          }

          // You can return any component that you like here!
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
      tabBarOptions={{
        activeTintColor: colors.primary,
        inactiveTintColor: colors.grey0,
        showLabel: false,
      }}
    >
      <Tab.Screen name="Main" component={MainNavigation} />
      <Tab.Screen name="Settings" component={SettingStackScreen} />
    </Tab.Navigator>
  );
};

export const MainTabNavigationWithDrawer: FunctionComponent = () => {
  return (
    <Drawer.Navigator
      drawerType="slide"
      drawerContent={(props) => <DrawerContent {...props} />}
    >
      <Drawer.Screen name="MainTab" component={MainTabNavigation} />
    </Drawer.Navigator>
  );
};

export const AppNavigation: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();
  const navigationRef = useRef<NavigationContainerRef>();
  const routeNameRef = useRef<string>();

  return (
    <React.Fragment>
      <NavigationContainer
        ref={navigationRef}
        onReady={() =>
          (routeNameRef.current = navigationRef.current?.getCurrentRoute()?.name)
        }
        onStateChange={async () => {
          const previousRouteName = routeNameRef.current;
          const currentRouteName = navigationRef.current?.getCurrentRoute()
            ?.name;

          if (previousRouteName !== currentRouteName) {
            // The line below uses the expo-firebase-analytics tracker
            // https://docs.expo.io/versions/latest/sdk/firebase-analytics/
            // Change this line to use another Mobile analytics SDK
            await analytics().logScreenView({
              screen_name: currentRouteName,
              screen_class: currentRouteName,
            });
          }

          // Save the current route name for later comparison
          routeNameRef.current = currentRouteName;
        }}
      >
        {keyRingStore.status === KeyRingStatus.NOTLOADED ? (
          <SplashScreen />
        ) : (
          <Stack.Navigator
            initialRouteName={
              keyRingStore.status === KeyRingStatus.EMPTY
                ? "Register"
                : "MainTabDrawer"
            }
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen
              name="MainTabDrawer"
              component={MainTabNavigationWithDrawer}
            />
            <Stack.Screen name="Register" component={RegisterStackScreen} />
          </Stack.Navigator>
        )}
      </NavigationContainer>
      <ModalsRenderer />
    </React.Fragment>
  );
});
