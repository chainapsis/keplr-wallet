/* eslint-disable react/display-name */
import React, { FunctionComponent, useRef } from "react";
import { StatusBar, Text, View } from "react-native";
import { KeyRingStatus } from "@keplr-wallet/background";
import {
  NavigationContainer,
  NavigationContainerRef,
} from "@react-navigation/native";
import { useStore } from "./stores";
import { observer } from "mobx-react-lite";
import { RegisterStackScreen } from "./screens/register";
import { HomeScreen } from "./screens/home";
import { ModalsRenderer } from "./modals";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";
import { SendScreen } from "./screens/send";
import {
  ValidatorListScreen,
  ValidatorDetailsScreen,
  StakedListScreen,
  DelegateScreen,
  RedelegateScreen,
  UndelegateScreen,
  RedelegateValidatorScreen,
} from "./screens/stake";
import {
  GovernanceScreen,
  GovernanceDetailsScreeen,
} from "./screens/governance";
import { SettingStackScreen } from "./screens/setting";
import { createDrawerNavigator } from "@react-navigation/drawer";
import analytics from "@react-native-firebase/analytics";
import Ionicons from "react-native-vector-icons/Ionicons";
import { DrawerContent } from "./components/drawer";
import {
  alignItemsCenter,
  flex1,
  justifyContentCenter,
  fcHigh,
  h3,
  sf,
  useStyle,
} from "./styles";
import { GradientBackground } from "./components/svg";
import { BorderlessButton } from "react-native-gesture-handler";

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
  return (
    <Stack.Navigator
      screenOptions={{
        headerBackground: () => <GradientBackground />,
        headerTitleStyle: sf([h3, fcHigh]),
        headerTitleAlign: "center",
        headerBackTitleVisible: false,
        ...TransitionPresets.SlideFromRightIOS,
      }}
      initialRouteName="Home"
      headerMode="screen"
    >
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
  );
};

export const OtherNavigation: FunctionComponent = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerBackground: () => <GradientBackground />,
        headerTitleStyle: sf([h3, fcHigh]),
        headerTitleAlign: "center",
        headerBackTitleVisible: false,
        ...TransitionPresets.SlideFromRightIOS,
      }}
      headerMode="screen"
    >
      <Stack.Screen name="Send" component={SendScreen} />
      <Stack.Screen name="Validator List" component={ValidatorListScreen} />
      <Stack.Screen
        name="Validator Details"
        component={ValidatorDetailsScreen}
      />
      <Stack.Screen name="Staked List" component={StakedListScreen} />
      <Stack.Screen name="Delegate" component={DelegateScreen} />
      <Stack.Screen name="Undelegate" component={UndelegateScreen} />
      <Stack.Screen name="Redelegate" component={RedelegateScreen} />
      <Stack.Screen
        name="Redelegate Validator"
        component={RedelegateValidatorScreen}
      />
      <Stack.Screen name="Governance" component={GovernanceScreen} />
      <Stack.Screen
        name="Governance Details"
        component={GovernanceDetailsScreeen}
      />
    </Stack.Navigator>
  );
};

export const MainTabNavigation: FunctionComponent = () => {
  const style = useStyle();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = "";

          if (route.name === "Main") {
            iconName = "ios-grid";
          } else if (route.name === "Settings") {
            iconName = "settings";
          }

          // You can return any component that you like here!
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarButton: (props) => (
          <View
            style={{
              display: "flex",
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
            {/* @ts-ignore */}
            <BorderlessButton
              {...props}
              activeOpacity={1}
              style={{
                height: "100%",
                aspectRatio: 2,
                maxWidth: "100%",
              }}
            />
          </View>
        ),
      })}
      tabBarOptions={{
        activeTintColor: style.get("color-primary").color,
        inactiveTintColor: style.get("color-icon").color,
        style: {
          borderTopColor: style.get("border-color-border-white").borderColor,
          shadowColor: style.get("color-transparent").color,
          elevation: 0,
        },
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
  const navigationRef = useRef<NavigationContainerRef>(null);
  const routeNameRef = useRef<string>();

  return (
    <React.Fragment>
      <StatusBar
        translucent={true}
        backgroundColor="#FFFFFF00"
        barStyle="dark-content"
      />
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
              headerTitleStyle: sf([h3, fcHigh]),
              headerTitleAlign: "center",
              headerBackTitleVisible: false,
              ...TransitionPresets.SlideFromRightIOS,
            }}
            headerMode="screen"
          >
            <Stack.Screen
              name="MainTabDrawer"
              component={MainTabNavigationWithDrawer}
            />
            <Stack.Screen name="Register" component={RegisterStackScreen} />
            <Stack.Screen name="Others" component={OtherNavigation} />
          </Stack.Navigator>
        )}
      </NavigationContainer>
      <ModalsRenderer />
    </React.Fragment>
  );
});
