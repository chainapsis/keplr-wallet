import React, { FunctionComponent } from "react";
import { KeyRingStatus } from "@keplr-wallet/background";
import { NavigationContainer } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";

import { useStyle } from "styles/index";
import { useStore } from "stores/index";

import { UnlockScreen } from "screens/unlock/new";
import { SettingChainListScreen } from "screens/setting/screens/chain-list";
import {
  AddAddressBookScreen,
  AddressBookScreen,
  EditAddressBookScreen,
} from "screens/setting/screens/address-book";
import { PageScrollPositionProvider } from "providers/page-scroll-position";
import { BlurHeaderOptionsPreset } from "components/header";
import { FocusedScreenProvider } from "providers/focused-screen";

//import Bugsnag from "@bugsnag/react-native";
import { SmartNavigatorProvider } from "navigation/smart-navigation";
import { RegisterNavigation } from "navigation/register-navigation";
import { OtherNavigation } from "navigation/other-navigation";
import { MainTabNavigationWithDrawer } from "navigation/navigation-tab-with-drawer";

export const Stack = createStackNavigator();

export const AddressBookStackScreen: FunctionComponent = () => {
  const style = useStyle();

  return (
    <Stack.Navigator
      screenOptions={{
        ...TransitionPresets.SlideFromRightIOS,
        headerTitleStyle: style.flatten(["h5", "color-text-high"]),
        headerMode: "screen",
      }}
    >
      <Stack.Screen
        options={{
          ...BlurHeaderOptionsPreset,

          title: "Address book",
        }}
        name="AddressBook"
        component={AddressBookScreen}
      />
      <Stack.Screen
        options={{
          ...BlurHeaderOptionsPreset,
          title: "Add an address",
        }}
        name="AddAddressBook"
        component={AddAddressBookScreen}
      />
      <Stack.Screen
        options={{
          ...BlurHeaderOptionsPreset,
          title: "Edit address book",
        }}
        name="EditAddressBook"
        component={EditAddressBookScreen}
      />
    </Stack.Navigator>
  );
};

export const ChainListStackScreen: FunctionComponent = () => {
  const style = useStyle();

  return (
    <Stack.Navigator
      screenOptions={{
        ...TransitionPresets.SlideFromRightIOS,
        headerTitleStyle: style.flatten(["h5", "color-text-high"]),
        headerMode: "screen",
      }}
    >
      <Stack.Screen
        options={{
          ...BlurHeaderOptionsPreset,
          title: "Manage networks",
        }}
        name="Setting.ChainList"
        component={SettingChainListScreen}
      />
    </Stack.Navigator>
  );
};

//const BugsnagNavigationContainerPlugin = Bugsnag.getPlugin("reactNavigation");
// The returned BugsnagNavigationContainer has exactly the same usage
// except now it tracks route information to send with your error reports
// const BugsnagNavigationContainer = (() => {
//   if (BugsnagNavigationContainerPlugin) {
//     console.log("BugsnagNavigationContainerPlugin found");
//     return BugsnagNavigationContainerPlugin.createNavigationContainer(
//       NavigationContainer
//     );
//   } else {
//     console.log(
//       "WARNING: BugsnagNavigationContainerPlugin is null. Fallback to use basic NavigationContainer"
//     );
//     return NavigationContainer;
//   }
// })();

export const AppNavigation: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();

  //const navigationRef = useRef<NavigationContainerRef | null>(null);
  //const routeNameRef = useRef<string | null>(null);

  //const style = useStyle();

  return (
    <PageScrollPositionProvider>
      <FocusedScreenProvider>
        <SmartNavigatorProvider>
          {/*<BugsnagNavigationContainer*/}
          {/* ref={navigationRef}
            theme={style.theme === "dark" ? DarkTheme : DefaultTheme}
            onReady={() => {
              const routerName = navigationRef.current?.getCurrentRoute();
              if (routerName) {
                routeNameRef.current = routerName.name;

                analyticsStore.logPageView(routerName.name);
              }
            }}
            onStateChange={() => {
              const routerName = navigationRef.current?.getCurrentRoute();
              if (routerName) {
                const previousRouteName = routeNameRef.current;
                const currentRouteName = routerName.name;

                if (previousRouteName !== currentRouteName) {
                  analyticsStore.logPageView(currentRouteName);
                }

                routeNameRef.current = currentRouteName;
              }
            }}
          > */}
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName={
                keyRingStore.status !== KeyRingStatus.UNLOCKED
                  ? "Unlock"
                  : "MainTabDrawer"
              }
              screenOptions={{
                headerShown: false,
                ...TransitionPresets.SlideFromRightIOS,
                headerMode: "screen",
              }}
            >
              <Stack.Screen name="Unlock" component={UnlockScreen} />
              <Stack.Screen
                name="MainTabDrawer"
                component={MainTabNavigationWithDrawer}
              />
              <Stack.Screen name="Register" component={RegisterNavigation} />
              <Stack.Screen name="Others" component={OtherNavigation} />
              <Stack.Screen
                name="AddressBooks"
                component={AddressBookStackScreen}
              />
              <Stack.Screen name="ChainList" component={ChainListStackScreen} />
            </Stack.Navigator>
          </NavigationContainer>
          {/*</BugsnagNavigationContainer>*/}
          {/* <ModalsRenderer /> */}
        </SmartNavigatorProvider>
      </FocusedScreenProvider>
    </PageScrollPositionProvider>
  );
});
