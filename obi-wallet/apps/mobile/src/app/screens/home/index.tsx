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
import { useIntl, FormattedMessage } from "react-intl";
import { TouchableHighlight } from "react-native-gesture-handler";

import { isSmallScreenNumber } from "../components/screen-size";
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

  const intl = useIntl();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let icon;

          if (route.name === "Home") {
            icon = faHome;
          }
          switch (route.name) {
            case intl.formatMessage({ id: "menu.assets" }):
              return !focused ? <AssetsIcon /> : <AssetsIconActive />;
            case intl.formatMessage({ id: "menu.apps" }):
              return !focused ? <AppsIcon /> : <AppsIconActive />;
            case intl.formatMessage({ id: "menu.nfts" }):
              return !focused ? <NFTsIcon /> : <NFTsIconActive />;
            case intl.formatMessage({ id: "menu.trade" }):
              return !focused ? <TradeIcon /> : <TradeIconActive />;
            case intl.formatMessage({ id: "menu.settings" }):
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
          paddingTop: isSmallScreenNumber(10, 15),
          paddingBottom: isSmallScreenNumber(10, 30),
          height: isSmallScreenNumber(65, 85),
        },

        headerShown: false,

        tabBarActiveTintColor: "#F6F5FF",
        tabBarInactiveTintColor: "#4D5070",
        tabBarLabelStyle: {
          fontFamily: "Inter",
          fontSize: 10,
          fontWeight: "500",
          textTransform: "uppercase",
          marginTop: 10,
          letterSpacing: 0.6,
        },
      })}
    >
      <Tab.Screen
        name={intl.formatMessage({ id: "menu.assets" })}
        component={Assets}
        initialParams={initialParams}
      />
      <Tab.Screen
        name={intl.formatMessage({ id: "menu.nfts" })}
        component={NFTs}
        initialParams={initialParams}
      />
      <Tab.Screen
        name={intl.formatMessage({ id: "menu.apps" })}
        component={DappExplorer}
        initialParams={initialParams}
      />
      <Tab.Screen
        name={intl.formatMessage({ id: "menu.trade" })}
        component={Trade}
        initialParams={initialParams}
      />
      <Tab.Screen
        name={intl.formatMessage({ id: "menu.settings" })}
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
        <FormattedMessage id="sidemenu.networks" defaultMessage="Networks" />
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
        <FormattedMessage
          id="sidemenu.morecomingsoon"
          defaultMessage="More coming soon"
        />
      </Text>
    </DrawerContentScrollView>
  );
}
