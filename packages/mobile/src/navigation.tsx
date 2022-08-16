/* eslint-disable react/display-name */
import React, { FunctionComponent, useEffect, useRef } from "react";
import { Text, View } from "react-native";
import {
  BIP44HDPath,
  ExportKeyRingData,
  KeyRingStatus,
} from "@keplr-wallet/background";
import {
  DrawerActions,
  NavigationContainer,
  NavigationContainerRef,
  useNavigation,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { useStore } from "./stores";
import { observer } from "mobx-react-lite";
import { HomeScreen } from "./screens/home";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";
import { SendScreen } from "./screens/send";
import {
  GovernanceDetailsScreen,
  GovernanceScreen,
} from "./screens/governance";
import {
  createDrawerNavigator,
  useIsDrawerOpen,
} from "@react-navigation/drawer";
import { DrawerContent } from "./components/drawer";
import { useStyle } from "./styles";
import { BorderlessButton } from "react-native-gesture-handler";
import { createSmartNavigatorProvider, SmartNavigator } from "./hooks";
import { SettingScreen } from "./screens/setting";
import { SettingSelectAccountScreen } from "./screens/setting/screens/select-account";
import { ViewPrivateDataScreen } from "./screens/setting/screens/view-private-data";
import { SettingChainListScreen } from "./screens/setting/screens/chain-list";
import { WebScreen } from "./screens/web";
import { RegisterIntroScreen } from "./screens/register";
import {
  NewMnemonicConfig,
  NewMnemonicScreen,
  RecoverMnemonicScreen,
  VerifyMnemonicScreen,
} from "./screens/register/mnemonic";
import { RegisterEndScreen } from "./screens/register/end";
import { RegisterNewUserScreen } from "./screens/register/new-user";
import { RegisterNotNewUserScreen } from "./screens/register/not-new-user";
import {
  AddressBookConfig,
  AddressBookData,
  IMemoConfig,
  IRecipientConfig,
  RegisterConfig,
} from "@keplr-wallet/hooks";
import {
  DelegateScreen,
  StakingDashboardScreen,
  ValidatorDetailsScreen,
  ValidatorListScreen,
} from "./screens/stake";
import { OpenDrawerIcon, ScanIcon } from "./components/icon";
import {
  AddAddressBookScreen,
  AddressBookScreen,
} from "./screens/setting/screens/address-book";
import { NewLedgerScreen } from "./screens/register/ledger";
import { PageScrollPositionProvider } from "./providers/page-scroll-position";
import {
  HeaderLeftButton,
  HeaderRightButton,
  HeaderOnGradientScreenOptionsPreset,
  HeaderOnSecondaryScreenOptionsPreset,
  HeaderAtSecondaryScreenOptionsPreset,
  HeaderOnTertiaryScreenOptionsPreset,
  TransparentHeaderOptionsPreset,
} from "./components/header";
import { TokensScreen } from "./screens/tokens";
import { UndelegateScreen } from "./screens/stake/undelegate";
import { RedelegateScreen } from "./screens/stake/redelegate";
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
import { TorusSignInScreen } from "./screens/register/torus";
import {
  HeaderAddIcon,
  HeaderWalletConnectIcon,
} from "./components/header/icon";
import { BlurredBottomTabBar } from "./components/bottom-tabbar";
import { UnlockScreen } from "./screens/unlock";
import { KeplrVersionScreen } from "./screens/setting/screens/version";
import {
  SettingAddTokenScreen,
  SettingManageTokensScreen,
} from "./screens/setting/screens/token";
import { ManageWalletConnectScreen } from "./screens/manage-wallet-connect";
import {
  ImportFromExtensionIntroScreen,
  ImportFromExtensionScreen,
  ImportFromExtensionSetPasswordScreen,
} from "./screens/register/import-from-extension";
import {
  OsmosisWebpageScreen,
  OsmosisFrontierWebpageScreen,
  StargazeWebpageScreen,
  UmeeWebpageScreen,
  JunoswapWebpageScreen,
} from "./screens/web/webpages";
import { WebpageScreenScreenOptionsPreset } from "./screens/web/components/webpage-screen";
import Bugsnag from "@bugsnag/react-native";

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
    "Register.ImportFromExtension.Intro": {
      upperScreenName: "Register",
    },
    "Register.ImportFromExtension": {
      upperScreenName: "Register",
    },
    "Register.ImportFromExtension.SetPassword": {
      upperScreenName: "Register",
    },
    "Register.End": {
      upperScreenName: "Register",
    },
    Home: {
      upperScreenName: "Main",
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
    ManageWalletConnect: {
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
    "Setting.ViewPrivateData": {
      upperScreenName: "Settings",
    },
    "Setting.Version": {
      upperScreenName: "Settings",
    },
    "Setting.ChainList": {
      upperScreenName: "ChainList",
    },
    "Setting.AddToken": {
      upperScreenName: "Others",
    },
    "Setting.ManageTokens": {
      upperScreenName: "Others",
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
    "Web.Intro": {
      upperScreenName: "Web",
    },
    "Web.Osmosis": {
      upperScreenName: "Web",
    },
    "Web.OsmosisFrontier": {
      upperScreenName: "Web",
    },
    "Web.Stargaze": {
      upperScreenName: "Web",
    },
    "Web.Umee": {
      upperScreenName: "Web",
    },
    "Web.Junoswap": {
      upperScreenName: "Web",
    },
  }).withParams<{
    "Register.NewMnemonic": {
      registerConfig: RegisterConfig;
    };
    "Register.VerifyMnemonic": {
      registerConfig: RegisterConfig;
      newMnemonicConfig: NewMnemonicConfig;
      bip44HDPath: BIP44HDPath;
    };
    "Register.RecoverMnemonic": {
      registerConfig: RegisterConfig;
    };
    "Register.NewLedger": {
      registerConfig: RegisterConfig;
    };
    "Register.TorusSignIn": {
      registerConfig: RegisterConfig;
      type: "google" | "apple";
    };
    "Register.ImportFromExtension.Intro": {
      registerConfig: RegisterConfig;
    };
    "Register.ImportFromExtension": {
      registerConfig: RegisterConfig;
    };
    "Register.ImportFromExtension.SetPassword": {
      registerConfig: RegisterConfig;
      exportKeyRingDatas: ExportKeyRingData[];
      addressBooks: { [chainId: string]: AddressBookData[] | undefined };
    };
    "Register.End": {
      password?: string;
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
    "Setting.ViewPrivateData": {
      privateData: string;
      privateDataType: string;
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

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

const HomeScreenHeaderLeft: FunctionComponent = observer(() => {
  const { chainStore } = useStore();

  const style = useStyle();

  const navigation = useNavigation();

  return (
    <HeaderLeftButton
      onPress={() => {
        navigation.dispatch(DrawerActions.toggleDrawer());
      }}
    >
      <View style={style.flatten(["flex-row", "items-center"])}>
        <OpenDrawerIcon
          size={28}
          color={
            style.flatten(["color-blue-400", "dark:color-platinum-300"]).color
          }
        />
        <Text style={style.flatten(["h4", "color-text-high", "margin-left-4"])}>
          {chainStore.current.chainName}
        </Text>
      </View>
    </HeaderLeftButton>
  );
});

const HomeScreenHeaderRight: FunctionComponent = observer(() => {
  const { walletConnectStore } = useStore();

  const style = useStyle();

  const navigation = useNavigation();

  return (
    <React.Fragment>
      <HeaderRightButton
        onPress={() => {
          navigation.navigate("Others", {
            screen: "Camera",
          });
        }}
      >
        <ScanIcon
          size={28}
          color={
            style.flatten(["color-blue-400", "dark:color-platinum-50"]).color
          }
        />
      </HeaderRightButton>
      {walletConnectStore.sessions.length > 0 ? (
        <HeaderRightButton
          style={{
            right: 42,
          }}
          onPress={() => {
            navigation.navigate("Others", {
              screen: "ManageWalletConnect",
            });
          }}
        >
          <HeaderWalletConnectIcon
            color={
              style.flatten(["color-blue-400", "dark:color-platinum-50"]).color
            }
          />
        </HeaderRightButton>
      ) : null}
    </React.Fragment>
  );
});

export const MainNavigation: FunctionComponent = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        ...TransitionPresets.SlideFromRightIOS,
      }}
      initialRouteName="Home"
      headerMode="screen"
    >
      <Stack.Screen
        options={{
          ...HeaderOnGradientScreenOptionsPreset,

          headerTitle: "",
          headerLeft: () => <HomeScreenHeaderLeft />,
          headerRight: () => <HomeScreenHeaderRight />,
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
        ...TransitionPresets.SlideFromRightIOS,
        headerTitleStyle: style.flatten(["h5", "color-text-high"]),
      }}
      initialRouteName="Register.Intro"
      headerMode="screen"
    >
      <Stack.Screen
        options={{
          ...TransparentHeaderOptionsPreset,
          title: "",
        }}
        name="Register.Intro"
        component={RegisterIntroScreen}
      />
      <Stack.Screen
        options={{
          ...TransparentHeaderOptionsPreset,
          title: "Create a New Wallet",
        }}
        name="Register.NewUser"
        component={RegisterNewUserScreen}
      />
      <Stack.Screen
        options={{
          ...TransparentHeaderOptionsPreset,
          title: "Import Existing Wallet",
        }}
        name="Register.NotNewUser"
        component={RegisterNotNewUserScreen}
      />
      <Stack.Screen
        options={{
          ...HeaderOnTertiaryScreenOptionsPreset,
          title: "Create New Mnemonic",
        }}
        name="Register.NewMnemonic"
        component={NewMnemonicScreen}
      />
      <Stack.Screen
        options={{
          ...HeaderOnTertiaryScreenOptionsPreset,
          title: "Verify Mnemonic",
        }}
        name="Register.VerifyMnemonic"
        component={VerifyMnemonicScreen}
      />
      <Stack.Screen
        options={{
          ...HeaderOnTertiaryScreenOptionsPreset,
          title: "Import Existing Wallet",
        }}
        name="Register.RecoverMnemonic"
        component={RecoverMnemonicScreen}
      />
      <Stack.Screen
        options={{
          ...HeaderOnTertiaryScreenOptionsPreset,
          title: "Import Hardware Wallet",
        }}
        name="Register.NewLedger"
        component={NewLedgerScreen}
      />
      <Stack.Screen
        options={{
          ...HeaderOnTertiaryScreenOptionsPreset,
        }}
        name="Register.TorusSignIn"
        component={TorusSignInScreen}
      />
      <Stack.Screen
        options={{
          ...TransparentHeaderOptionsPreset,
          // Only show the back button.
          title: "",
        }}
        name="Register.ImportFromExtension.Intro"
        component={ImportFromExtensionIntroScreen}
      />
      <Stack.Screen
        options={{
          headerShown: false,
        }}
        name="Register.ImportFromExtension"
        component={ImportFromExtensionScreen}
      />
      <Stack.Screen
        options={{
          ...HeaderOnTertiaryScreenOptionsPreset,
          title: "Import Extension",
        }}
        name="Register.ImportFromExtension.SetPassword"
        component={ImportFromExtensionSetPasswordScreen}
      />
      <Stack.Screen
        options={{
          ...TransparentHeaderOptionsPreset,
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

  const navigation = useNavigation();

  return (
    <Stack.Navigator
      screenOptions={{
        ...TransitionPresets.SlideFromRightIOS,
        headerTitleStyle: style.flatten(["h5", "color-text-high"]),
      }}
      headerMode="screen"
    >
      <Stack.Screen
        options={{
          ...HeaderOnTertiaryScreenOptionsPreset,
          title: "Send",
        }}
        name="Send"
        component={SendScreen}
      />
      <Stack.Screen
        options={{
          ...HeaderOnGradientScreenOptionsPreset,
          title: "Tokens",
        }}
        name="Tokens"
        component={TokensScreen}
      />
      <Stack.Screen
        options={{
          headerShown: false,
        }}
        name="Camera"
        component={CameraScreen}
      />
      <Stack.Screen
        options={{
          ...HeaderOnSecondaryScreenOptionsPreset,
          title: "WalletConnect",
        }}
        name="ManageWalletConnect"
        component={ManageWalletConnectScreen}
      />
      <Stack.Screen
        options={{
          ...HeaderOnGradientScreenOptionsPreset,
          title: "Validator Details",
        }}
        name="Validator Details"
        component={ValidatorDetailsScreen}
      />
      <Stack.Screen
        options={{
          ...HeaderOnGradientScreenOptionsPreset,
          title: "Governance",
        }}
        name="Governance"
        component={GovernanceScreen}
      />
      <Stack.Screen
        options={{
          ...HeaderOnGradientScreenOptionsPreset,
          title: "Proposal",
        }}
        name="Governance Details"
        component={GovernanceDetailsScreen}
      />
      <Stack.Screen
        options={{
          ...HeaderOnGradientScreenOptionsPreset,
          title: "Staking Dashboard",
        }}
        name="Staking.Dashboard"
        component={StakingDashboardScreen}
      />
      <Stack.Screen
        options={{
          ...HeaderOnGradientScreenOptionsPreset,
          title: "Validator Details",
        }}
        name="Validator.Details"
        component={ValidatorDetailsScreen}
      />
      <Stack.Screen
        options={{
          ...HeaderAtSecondaryScreenOptionsPreset,
          title: "All Active Validators",
        }}
        name="Validator.List"
        component={ValidatorListScreen}
      />
      <Stack.Screen
        options={{
          ...HeaderOnTertiaryScreenOptionsPreset,
          title: "Stake",
        }}
        name="Delegate"
        component={DelegateScreen}
      />
      <Stack.Screen
        options={{
          ...HeaderOnTertiaryScreenOptionsPreset,
          title: "Unstake",
        }}
        name="Undelegate"
        component={UndelegateScreen}
      />
      <Stack.Screen
        options={{
          ...HeaderOnTertiaryScreenOptionsPreset,
          title: "Switch Validator",
        }}
        name="Redelegate"
        component={RedelegateScreen}
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
      <Stack.Screen
        options={{
          ...HeaderOnTertiaryScreenOptionsPreset,
          title: "Add Token",
        }}
        name="Setting.AddToken"
        component={SettingAddTokenScreen}
      />
      <Stack.Screen
        options={{
          ...HeaderOnSecondaryScreenOptionsPreset,
          title: "Manage Tokens",
          headerRight: () => (
            <HeaderRightButton
              onPress={() => {
                navigation.navigate("Setting.AddToken");
              }}
            >
              <HeaderAddIcon />
            </HeaderRightButton>
          ),
        }}
        name="Setting.ManageTokens"
        component={SettingManageTokensScreen}
      />
    </Stack.Navigator>
  );
};

export const SettingStackScreen: FunctionComponent = () => {
  const style = useStyle();

  const navigation = useNavigation();

  const { analyticsStore } = useStore();

  return (
    <Stack.Navigator
      screenOptions={{
        ...TransitionPresets.SlideFromRightIOS,
        headerTitleStyle: style.flatten(["h5", "color-text-high"]),
      }}
      headerMode="screen"
    >
      <Stack.Screen
        options={{
          ...HeaderAtSecondaryScreenOptionsPreset,
          title: "Settings",
          headerTitleStyle: style.flatten(["h3", "color-text-high"]),
        }}
        name="Setting"
        component={SettingScreen}
      />
      <Stack.Screen
        name="SettingSelectAccount"
        options={{
          ...HeaderOnSecondaryScreenOptionsPreset,
          title: "Select Account",
          headerRight: () => (
            <HeaderRightButton
              onPress={() => {
                analyticsStore.logEvent("Add additional account started");
                navigation.navigate("Register", {
                  screen: "Register.Intro",
                });
              }}
            >
              <HeaderAddIcon />
            </HeaderRightButton>
          ),
        }}
        component={SettingSelectAccountScreen}
      />
      <Stack.Screen
        name="Setting.ViewPrivateData"
        options={{
          ...HeaderOnSecondaryScreenOptionsPreset,
        }}
        component={ViewPrivateDataScreen}
      />
      <Stack.Screen
        options={{
          ...HeaderAtSecondaryScreenOptionsPreset,
          title: "Version",
        }}
        name="Setting.Version"
        component={KeplrVersionScreen}
      />
    </Stack.Navigator>
  );
};

export const AddressBookStackScreen: FunctionComponent = () => {
  const style = useStyle();

  return (
    <Stack.Navigator
      screenOptions={{
        ...TransitionPresets.SlideFromRightIOS,
        headerTitleStyle: style.flatten(["h5", "color-text-high"]),
      }}
      headerMode="screen"
    >
      <Stack.Screen
        options={{
          ...HeaderOnSecondaryScreenOptionsPreset,
          title: "Address Book",
        }}
        name="AddressBook"
        component={AddressBookScreen}
      />
      <Stack.Screen
        options={{
          ...HeaderOnTertiaryScreenOptionsPreset,
          title: "New Address Book",
        }}
        name="AddAddressBook"
        component={AddAddressBookScreen}
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
      }}
      headerMode="screen"
    >
      <Stack.Screen
        options={{
          ...HeaderOnSecondaryScreenOptionsPreset,
          title: "Chain List",
        }}
        name="Setting.ChainList"
        component={SettingChainListScreen}
      />
    </Stack.Navigator>
  );
};

export const WebNavigation: FunctionComponent = () => {
  return (
    <Stack.Navigator
      initialRouteName="Web.Intro"
      screenOptions={{
        ...WebpageScreenScreenOptionsPreset,
      }}
      headerMode="screen"
    >
      <Stack.Screen
        options={{ headerShown: false }}
        name="Web.Intro"
        component={WebScreen}
      />
      <Stack.Screen name="Web.Osmosis" component={OsmosisWebpageScreen} />
      <Stack.Screen
        name="Web.OsmosisFrontier"
        component={OsmosisFrontierWebpageScreen}
      />
      <Stack.Screen name="Web.Stargaze" component={StargazeWebpageScreen} />
      <Stack.Screen name="Web.Umee" component={UmeeWebpageScreen} />
      <Stack.Screen name="Web.Junoswap" component={JunoswapWebpageScreen} />
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
              return (
                <Svg width={size} height={size} fill="none" viewBox="0 0 24 24">
                  <Path
                    fill={color}
                    d="M12 2C8.741 2 5.849 3.577 4.021 6H4v.027A9.931 9.931 0 002 12c0 5.511 4.489 10 10 10s10-4.489 10-10S17.511 2 12 2zm3 2.584A7.98 7.98 0 0120 12c0 2.088-.8 3.978-2.102 5.4A1.993 1.993 0 0016 16a1 1 0 01-1-1v-2a1 1 0 00-1-1h-4a1 1 0 010-2 1 1 0 001-1V8a1 1 0 011-1h1a2 2 0 002-2v-.416zM4.207 10.207L9 15v1a2 2 0 002 2v1.932a7.979 7.979 0 01-6.793-9.725z"
                  />
                </Svg>
              );
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
              rippleColor={style.get("color-rect-button-default-ripple").color}
              style={{
                height: "100%",
                aspectRatio: 1.9,
                maxWidth: "100%",
              }}
            />
          </View>
        ),
      })}
      tabBarOptions={{
        activeTintColor: style.flatten([
          "color-blue-400",
          "dark:color-platinum-50",
        ]).color,
        inactiveTintColor: style.flatten([
          "color-gray-200",
          "dark:color-platinum-300",
        ]).color,
        style: {
          borderTopWidth: 0.5,
          borderTopColor: style.get("blurred-tabbar-top-border"),
          backgroundColor: style.get("color-blurred-tabbar-background").color,
          shadowColor: style.get("color-transparent").color,
          elevation: 0,
          paddingLeft: 30,
          paddingRight: 30,
        },
        showLabel: false,
      }}
      tabBar={(props) => (
        <BlurredBottomTabBar {...props} enabledScreens={["Home"]} />
      )}
    >
      <Tab.Screen name="Main" component={MainNavigation} />
      <Tab.Screen name="Web" component={WebNavigation} />
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
  const style = useStyle();

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
      overlayColor={
        style.flatten(["color-gray-700@50%", "dark:color-gray-700@75%"]).color
      }
      gestureHandlerProps={{
        hitSlop: {},
      }}
    >
      <Drawer.Screen name="MainTab" component={MainTabNavigation} />
    </Drawer.Navigator>
  );
};

const BugsnagNavigationContainerPlugin = Bugsnag.getPlugin("reactNavigation");
// The returned BugsnagNavigationContainer has exactly the same usage
// except now it tracks route information to send with your error reports
const BugsnagNavigationContainer = (() => {
  if (BugsnagNavigationContainerPlugin) {
    console.log("BugsnagNavigationContainerPlugin found");
    return BugsnagNavigationContainerPlugin.createNavigationContainer(
      NavigationContainer
    );
  } else {
    console.log(
      "WARNING: BugsnagNavigationContainerPlugin is null. Fallback to use basic NavigationContainer"
    );
    return NavigationContainer;
  }
})();

export const AppNavigation: FunctionComponent = observer(() => {
  const { keyRingStore, analyticsStore } = useStore();

  const navigationRef = useRef<NavigationContainerRef | null>(null);
  const routeNameRef = useRef<string | null>(null);

  const style = useStyle();

  return (
    <PageScrollPositionProvider>
      <FocusedScreenProvider>
        <SmartNavigatorProvider>
          <BugsnagNavigationContainer
            ref={navigationRef}
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
          >
            <Stack.Navigator
              initialRouteName={
                keyRingStore.status !== KeyRingStatus.UNLOCKED
                  ? "Unlock"
                  : "MainTabDrawer"
              }
              screenOptions={{
                headerShown: false,
                ...TransitionPresets.SlideFromRightIOS,
              }}
              headerMode="screen"
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
          </BugsnagNavigationContainer>
          {/* <ModalsRenderer /> */}
        </SmartNavigatorProvider>
      </FocusedScreenProvider>
    </PageScrollPositionProvider>
  );
});
