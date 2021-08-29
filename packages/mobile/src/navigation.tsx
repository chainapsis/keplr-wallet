/* eslint-disable react/display-name */
import React, { FunctionComponent, useEffect, useRef } from "react";
import { StatusBar, Text, View } from "react-native";
import { KeyRingStatus } from "@keplr-wallet/background";
import {
  DrawerActions,
  NavigationContainer,
  NavigationContainerRef,
  useNavigation,
} from "@react-navigation/native";
import { useStore } from "./stores";
import { observer } from "mobx-react-lite";
import { HomeScreen } from "./screens/home/staging";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";
import { SendScreen } from "./screens/send/staging";
import { StakedListScreen, RedelegateValidatorScreen } from "./screens/stake";
import {
  GovernanceScreen,
  GovernanceDetailsScreen,
} from "./screens/governance/staging";
import {
  createDrawerNavigator,
  useIsDrawerOpen,
} from "@react-navigation/drawer";
import analytics from "@react-native-firebase/analytics";
import Ionicons from "react-native-vector-icons/Ionicons";
import { DrawerContent } from "./components/drawer";
import { useStyle } from "./styles";
import { BorderlessButton } from "react-native-gesture-handler";
import { createSmartNavigatorProvider, SmartNavigator } from "./hooks";
import { SettingScreen } from "./screens/setting/staging";
import { SettingSelectAccountScreen } from "./screens/setting/staging/screens/select-account";
import { WebScreen } from "./screens/web";
import { RegisterIntroScreen } from "./screens/register/staging";
import {
  NewMnemonicConfig,
  NewMnemonicScreen,
  VerifyMnemonicScreen,
  RecoverMnemonicScreen,
} from "./screens/register/staging/mnemonic";
import { RegisterEndScreen } from "./screens/register/staging/end";
import { RegisterNewUserScreen } from "./screens/register/staging/new-user";
import { RegisterNotNewUserScreen } from "./screens/register/staging/not-new-user";
import { ResultScreen } from "./screens/result";
import {
  AddressBookConfig,
  IMemoConfig,
  IRecipientConfig,
  RegisterConfig,
} from "@keplr-wallet/hooks";
import {
  StakingDashboardScreen,
  ValidatorDetailsScreen,
  ValidatorListScreen,
  DelegateScreen,
} from "./screens/stake/staging";
import { OpenDrawerIcon, ScanIcon } from "./components/staging/icon";
import {
  AddAddressBookScreen,
  AddressBookScreen,
} from "./screens/setting/staging/screens/address-book";
import { NewLedgerScreen } from "./screens/register/staging/ledger";
import { PageScrollPositionProvider } from "./providers/page-scroll-position";
import {
  BlurredHeaderScreenOptionsPreset,
  HeaderLeftButton,
  HeaderRightButton,
  PlainHeaderScreenOptionsPreset,
} from "./components/staging/header";
import { TokensScreen } from "./screens/tokens";
import { UndelegateScreen } from "./screens/stake/staging/undelegate";
import { RedelegateScreen } from "./screens/stake/staging/redelegate";
import { CameraScreen } from "./screens/camera";
import {
  FocusedScreenProvider,
  useFocusedScreen,
} from "./providers/focused-screen";
import Svg, { Path, Rect } from "react-native-svg";
import {
  TxFailedResultScreen,
  TxPendingResultScreen,
  TxSuccessResultScreen,
} from "./screens/tx-result";
import { TorusSignInScreen } from "./screens/register/staging/torus";

const {
  SmartNavigatorProvider,
  useSmartNavigation,
} = createSmartNavigatorProvider(
  new SmartNavigator({
    "Register.Intro": {
      upperScreenName: "Register",
    },
    "Register.NewUser": {
      upperScreenName: "Register",
    },
    "Register.NotNewUser": {
      upperScreenName: "Register",
    },
    "Register.NewMnemonic": {
      upperScreenName: "Register",
    },
    "Register.VerifyMnemonic": {
      upperScreenName: "Register",
    },
    "Register.RecoverMnemonic": {
      upperScreenName: "Register",
    },
    "Register.NewLedger": {
      upperScreenName: "Register",
    },
    "Register.TorusSignIn": {
      upperScreenName: "Register",
    },
    "Register.End": {
      upperScreenName: "Register",
    },
    Home: {
      upperScreenName: "MainTabDrawer",
    },
    Send: {
      upperScreenName: "Others",
    },
    Tokens: {
      upperScreenName: "Others",
    },
    Camera: {
      upperScreenName: "Others",
    },
    "Staking.Dashboard": {
      upperScreenName: "Others",
    },
    "Validator.Details": {
      upperScreenName: "Others",
    },
    "Validator.List": {
      upperScreenName: "Others",
    },
    Delegate: {
      upperScreenName: "Others",
    },
    Undelegate: {
      upperScreenName: "Others",
    },
    Redelegate: {
      upperScreenName: "Others",
    },
    Governance: {
      upperScreenName: "Others",
    },
    "Governance Details": {
      upperScreenName: "Others",
    },
    Setting: {
      upperScreenName: "Settings",
    },
    SettingSelectAccount: {
      upperScreenName: "Settings",
    },
    AddressBook: {
      upperScreenName: "AddressBooks",
    },
    AddAddressBook: {
      upperScreenName: "AddressBooks",
    },
    Result: {
      upperScreenName: "Others",
    },
    TxPendingResult: {
      upperScreenName: "Others",
    },
    TxSuccessResult: {
      upperScreenName: "Others",
    },
    TxFailedResult: {
      upperScreenName: "Others",
    },
  }).withParams<{
    "Register.NewMnemonic": {
      registerConfig: RegisterConfig;
    };
    "Register.VerifyMnemonic": {
      registerConfig: RegisterConfig;
      newMnemonicConfig: NewMnemonicConfig;
    };
    "Register.RecoverMnemonic": {
      registerConfig: RegisterConfig;
    };
    "Register.NewLedger": {
      registerConfig: RegisterConfig;
    };
    "Register.TorusSignIn": {
      registerConfig: RegisterConfig;
    };
    Send: {
      chainId?: string;
      currency?: string;
      recipient?: string;
    };
    "Validator.Details": {
      validatorAddress: string;
    };
    "Validator.List": {
      validatorSelector?: (validatorAddress: string) => void;
    };
    Delegate: {
      validatorAddress: string;
    };
    Undelegate: {
      validatorAddress: string;
    };
    Redelegate: {
      validatorAddress: string;
    };
    "Governance Details": {
      proposalId: string;
    };
    AddressBook: {
      recipientConfig?: IRecipientConfig;
      memoConfig?: IMemoConfig;
    };
    AddAddressBook: {
      chainId: string;
      addressBookConfig: AddressBookConfig;
    };
    TxPendingResult: {
      chainId?: string;
      txHash: string;
    };
    TxSuccessResult: {
      chainId?: string;
      txHash: string;
    };
    TxFailedResult: {
      chainId?: string;
      txHash: string;
    };
  }>()
);

export { useSmartNavigation };

const SplashScreen: FunctionComponent = () => {
  const style = useStyle();

  return (
    <View style={style.flatten(["flex-1", "items-center", "justify-center"])}>
      <Text>Loading...</Text>
    </View>
  );
};

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

export const MainNavigation: FunctionComponent = () => {
  const style = useStyle();

  const navigation = useNavigation();

  return (
    <Stack.Navigator
      screenOptions={{
        ...BlurredHeaderScreenOptionsPreset,
        headerTitleStyle: style.flatten(["h4", "color-text-black-high"]),
        headerTitleContainerStyle: {
          left: 52,
        },
        headerTitleAlign: "left",
      }}
      initialRouteName="Home"
      headerMode="screen"
    >
      <Stack.Screen
        options={{
          headerLeft: () => (
            <HeaderLeftButton
              onPress={() => {
                navigation.dispatch(DrawerActions.toggleDrawer());
              }}
            >
              <OpenDrawerIcon
                size={28}
                color={style.get("color-primary").color}
              />
            </HeaderLeftButton>
          ),
          headerRight: () => (
            <HeaderRightButton
              onPress={() => {
                navigation.navigate("Others", {
                  screen: "Camera",
                });
              }}
            >
              <ScanIcon size={28} color={style.get("color-primary").color} />
            </HeaderRightButton>
          ),
        }}
        name="Home"
        component={HomeScreen}
      />
    </Stack.Navigator>
  );
};

export const RegisterNavigation: FunctionComponent = () => {
  const style = useStyle();

  return (
    <Stack.Navigator
      screenOptions={{
        ...PlainHeaderScreenOptionsPreset,
        headerTitleStyle: style.flatten(["h5", "color-text-black-high"]),
      }}
      initialRouteName="Intro"
      headerMode="screen"
    >
      <Stack.Screen
        options={{
          headerShown: false,
        }}
        name="Register.Intro"
        component={RegisterIntroScreen}
      />
      <Stack.Screen name="Register.NewUser" component={RegisterNewUserScreen} />
      <Stack.Screen
        name="Register.NotNewUser"
        component={RegisterNotNewUserScreen}
      />
      <Stack.Screen name="Register.NewMnemonic" component={NewMnemonicScreen} />
      <Stack.Screen
        name="Register.VerifyMnemonic"
        component={VerifyMnemonicScreen}
      />
      <Stack.Screen
        name="Register.RecoverMnemonic"
        component={RecoverMnemonicScreen}
      />
      <Stack.Screen name="Register.NewLedger" component={NewLedgerScreen} />
      <Stack.Screen name="Register.TorusSignIn" component={TorusSignInScreen} />
      <Stack.Screen
        options={{
          headerShown: false,
        }}
        name="Register.End"
        component={RegisterEndScreen}
      />
    </Stack.Navigator>
  );
};

export const OtherNavigation: FunctionComponent = () => {
  const style = useStyle();

  return (
    <Stack.Navigator
      screenOptions={{
        ...BlurredHeaderScreenOptionsPreset,
        headerTitleStyle: style.flatten(["h5", "color-text-black-high"]),
      }}
      headerMode="screen"
    >
      <Stack.Screen name="Send" component={SendScreen} />
      <Stack.Screen name="Tokens" component={TokensScreen} />
      <Stack.Screen
        options={{
          headerShown: false,
        }}
        name="Camera"
        component={CameraScreen}
      />
      <Stack.Screen name="Validator List" component={ValidatorListScreen} />
      <Stack.Screen
        name="Validator Details"
        component={ValidatorDetailsScreen}
      />
      <Stack.Screen name="Staked List" component={StakedListScreen} />
      <Stack.Screen
        name="Redelegate Validator"
        component={RedelegateValidatorScreen}
      />
      <Stack.Screen name="Governance" component={GovernanceScreen} />
      <Stack.Screen
        name="Governance Details"
        component={GovernanceDetailsScreen}
      />
      <Stack.Screen
        name="Staking.Dashboard"
        component={StakingDashboardScreen}
      />
      <Stack.Screen
        name="Validator.Details"
        component={ValidatorDetailsScreen}
      />
      <Stack.Screen name="Validator.List" component={ValidatorListScreen} />
      <Stack.Screen name="Delegate" component={DelegateScreen} />
      <Stack.Screen name="Undelegate" component={UndelegateScreen} />
      <Stack.Screen name="Redelegate" component={RedelegateScreen} />
      <Stack.Screen
        options={{
          gestureEnabled: false,
          headerShown: false,
        }}
        name="Result"
        component={ResultScreen}
      />
      <Stack.Screen
        options={{
          gestureEnabled: false,
          headerShown: false,
        }}
        name="TxPendingResult"
        component={TxPendingResultScreen}
      />
      <Stack.Screen
        options={{
          gestureEnabled: false,
          headerShown: false,
        }}
        name="TxSuccessResult"
        component={TxSuccessResultScreen}
      />
      <Stack.Screen
        options={{
          gestureEnabled: false,
          headerShown: false,
        }}
        name="TxFailedResult"
        component={TxFailedResultScreen}
      />
    </Stack.Navigator>
  );
};

export const SettingStackScreen: FunctionComponent = () => {
  const style = useStyle();

  return (
    <Stack.Navigator
      screenOptions={{
        ...PlainHeaderScreenOptionsPreset,
        headerTitleStyle: style.flatten(["h5", "color-text-black-high"]),
      }}
      headerMode="screen"
    >
      <Stack.Screen name="Setting" component={SettingScreen} />
      <Stack.Screen
        name="SettingSelectAccount"
        options={{
          title: "Select Account",
          ...BlurredHeaderScreenOptionsPreset,
        }}
        component={SettingSelectAccountScreen}
      />
    </Stack.Navigator>
  );
};

export const AddressBookStackScreen: FunctionComponent = () => {
  const style = useStyle();

  return (
    <Stack.Navigator
      screenOptions={{
        ...BlurredHeaderScreenOptionsPreset,
        headerTitleStyle: style.flatten(["h5", "color-text-black-high"]),
      }}
      headerMode="screen"
    >
      <Stack.Screen name="AddressBook" component={AddressBookScreen} />
      <Stack.Screen name="AddAddressBook" component={AddAddressBookScreen} />
    </Stack.Navigator>
  );
};

export const MainTabNavigation: FunctionComponent = () => {
  const style = useStyle();

  const navigation = useNavigation();

  const focusedScreen = useFocusedScreen();
  const isDrawerOpen = useIsDrawerOpen();

  useEffect(() => {
    // When the focused screen is not "Home" screen and the drawer is open,
    // try to close the drawer forcely.
    if (focusedScreen.name !== "Home" && isDrawerOpen) {
      navigation.dispatch(DrawerActions.toggleDrawer());
    }
  }, [focusedScreen.name, isDrawerOpen, navigation]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color }) => {
          const size = 24;

          switch (route.name) {
            case "Main":
              return (
                <Svg width={size} height={size} fill="none" viewBox="0 0 24 24">
                  <Rect
                    width="8"
                    height="8"
                    x="3"
                    y="3"
                    fill={color}
                    rx="1.5"
                  />
                  <Rect
                    width="8"
                    height="8"
                    x="3"
                    y="13"
                    fill={color}
                    rx="1.5"
                  />
                  <Rect
                    width="8"
                    height="8"
                    x="13"
                    y="3"
                    fill={color}
                    rx="1.5"
                  />
                  <Rect
                    width="8"
                    height="8"
                    x="13"
                    y="13"
                    fill={color}
                    rx="1.5"
                  />
                </Svg>
              );
            case "Web":
              return <Ionicons name="apps-outline" size={size} color={color} />;
            case "Settings":
              return (
                <Svg width={size} height={size} fill="none" viewBox="0 0 24 24">
                  <Path
                    fill={color}
                    d="M12 2c-.528 0-1.046.045-1.55.131l-.311 1.302c-.484 2.023-2.544 3.225-4.52 2.635l-1.084-.325A10.124 10.124 0 003 8.598l.805.781a3.663 3.663 0 010 5.242L3 15.402c.36 1.043.882 2.006 1.535 2.855l1.084-.325c1.976-.59 4.036.612 4.52 2.635l.31 1.302a9.187 9.187 0 003.101 0l.311-1.302c.484-2.023 2.544-3.225 4.52-2.635l1.084.325A10.124 10.124 0 0021 15.402l-.805-.781a3.663 3.663 0 010-5.242L21 8.598a10.113 10.113 0 00-1.535-2.855l-1.084.325c-1.976.59-4.036-.612-4.52-2.635l-.31-1.302A9.184 9.184 0 0012 2zm0 7.273c1.491 0 2.7 1.22 2.7 2.727 0 1.506-1.209 2.727-2.7 2.727S9.3 13.507 9.3 12c0-1.506 1.209-2.727 2.7-2.727z"
                  />
                </Svg>
              );
          }
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
          borderTopWidth: 0.5,
          borderTopColor: style.get("border-color-border-white").borderColor,
          shadowColor: style.get("color-transparent").color,
          elevation: 0,
        },
        showLabel: false,
      }}
    >
      <Tab.Screen name="Main" component={MainNavigation} />
      {__DEV__ ? <Tab.Screen name="Web" component={WebScreen} /> : null}
      <Tab.Screen
        name="Settings"
        component={SettingStackScreen}
        options={{
          unmountOnBlur: true,
        }}
      />
    </Tab.Navigator>
  );
};

export const MainTabNavigationWithDrawer: FunctionComponent = () => {
  const focused = useFocusedScreen();

  return (
    <Drawer.Navigator
      drawerType="slide"
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        // If the focused screen is not "Home" screen,
        // disable the gesture to open drawer.
        swipeEnabled: focused.name === "Home",
        gestureEnabled: focused.name === "Home",
      }}
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
    <PageScrollPositionProvider>
      <FocusedScreenProvider>
        <SmartNavigatorProvider>
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
                  ...TransitionPresets.SlideFromRightIOS,
                }}
                headerMode="screen"
              >
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
              </Stack.Navigator>
            )}
          </NavigationContainer>
          {/* <ModalsRenderer /> */}
        </SmartNavigatorProvider>
      </FocusedScreenProvider>
    </PageScrollPositionProvider>
  );
});
