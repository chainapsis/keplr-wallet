import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { faHome } from "@fortawesome/free-solid-svg-icons/faHome";
import { faTimes } from "@fortawesome/free-solid-svg-icons/faTimes";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Text } from "@obi-wallet/common";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerScreenProps,
} from "@react-navigation/drawer";
import { ParamListBase } from "@react-navigation/native";
import { TouchableHighlight } from "react-native-gesture-handler";

import { screenWidth, smallDeviceMaxWidth } from "../components/screen-size";
import { DappExplorer } from "../dapp-explorer";
import { NFTs } from "../loop-web-apps/nfts";
import { Trade } from "../loop-web-apps/trade";
import { SettingsScreen } from "../settings";
import AppsIcon from "./assets/appsIcon.svg";
import AssetsIcon from "./assets/assetsIcon.svg";
import AppsIconActive from "./assets/ic_apps_active.svg";
import AssetsIconActive from "./assets/ic_assets_active.svg";
import NFTsIconActive from "./assets/ic_nfts_active.svg";
import SettingsIconActive from "./assets/ic_settings_active.svg";
import TradeIconActive from "./assets/ic_trade_active.svg";
import NFTsIcon from "./assets/nftsIcon.svg";
import SettingsIcon from "./assets/settingsIcon.svg";
import TradeIcon from "./assets/tradeIcon.svg";
import { Assets } from "./components/assets";

const networks = [
  {
    chainId: "uni-3",
    label: "Juno Mainnet",
  },
];

export type TabNavigationProps = DrawerScreenProps<ParamListBase>;

export function TabNavigation({ route }: TabNavigationProps) {
  const Tab = createBottomTabNavigator();

  const currentNetwork = route.name;
  const initialParams = { currentNetwork };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let icon;

          if (route.name === "Home") {
            icon = faHome;
          }
          switch (route.name) {
            case "Assets":
              return !focused ? <AssetsIcon /> : <AssetsIconActive />;
            case "Apps":
              return !focused ? <AppsIcon /> : <AppsIconActive />;
            case "NFTs":
              return !focused ? <NFTsIcon /> : <NFTsIconActive />;
            case "Trade":
              return !focused ? <TradeIcon /> : <TradeIconActive />;
            case "Settings":
              return !focused ? <SettingsIcon /> : <SettingsIconActive />;
            default:
              icon = faChevronLeft;
              break;
          }

          return <FontAwesomeIcon icon={icon} />;
        },
        tabBarStyle: {
          backgroundColor: "#17162C",
          borderTopColor: "#1E1D33",
          borderTopWidth: 1,
          paddingTop: screenWidth <= smallDeviceMaxWidth ? 10 : 15,
          paddingBottom: screenWidth <= smallDeviceMaxWidth ? 10 : 30,
          height: screenWidth <= smallDeviceMaxWidth ? 65 : 85,
        },

        headerShown: false,

        tabBarActiveTintColor: "#F6F5FF",
        tabBarInactiveTintColor: "#4D5070",
        tabBarLabelStyle: {
          fontFamily: "Inter",
          fontSize: 10,
          fontWeight: "500",
          textTransform: "uppercase",
          marginTop: screenWidth <= smallDeviceMaxWidth ? 10 : 10,
          letterSpacing: 0.6,
        },
      })}
    >
      <Tab.Screen
        name="Assets"
        component={Assets}
        initialParams={initialParams}
      />
      <Tab.Screen name="NFTs" component={NFTs} initialParams={initialParams} />
      <Tab.Screen
        name="Apps"
        component={DappExplorer}
        initialParams={initialParams}
      />
      <Tab.Screen
        name="Trade"
        component={Trade}
        initialParams={initialParams}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        initialParams={initialParams}
      />
    </Tab.Navigator>
  );
}

export function HomeScreen() {
  const Drawer = createDrawerNavigator();

  return (
    <Drawer.Navigator
      useLegacyImplementation={true}
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: "#F6F5FF",
        drawerActiveBackgroundColor: "#27253E",
        drawerInactiveTintColor: "#787B9C",
        drawerLabelStyle: {
          fontFamily: "Inter",
          fontSize: 16,
          fontWeight: "500",
        },
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      {networks.map((network) => {
        return (
          <Drawer.Screen
            key={network.chainId}
            name={network.label}
            component={TabNavigation}
          />
        );
      })}
    </Drawer.Navigator>
  );
}

function CustomDrawerContent(props) {
  const { navigation } = props;
  return (
    <DrawerContentScrollView {...props} style={{ backgroundColor: "#100F1E" }}>
      <TouchableHighlight
        style={{
          alignSelf: "flex-start",
          padding: 5,
          marginLeft: 16,
          marginBottom: 30,
        }}
        onPress={() => navigation.closeDrawer()}
      >
        <FontAwesomeIcon
          icon={faTimes}
          style={{ color: "#4d5070" }}
        ></FontAwesomeIcon>
      </TouchableHighlight>
      <Text
        style={{
          color: "#787B9C",
          marginLeft: 16,
          marginBottom: 17,
          fontSize: 11,
          textTransform: "uppercase",
        }}
      >
        Networks
      </Text>
      <DrawerItemList {...props} />
      <Text
        style={{
          color: "#787B9C",
          marginLeft: 16,
          marginTop: 17,
          fontSize: 11,
          textTransform: "uppercase",
        }}
      >
        More Coming Soon!
      </Text>
    </DrawerContentScrollView>
  );
}
