import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { faHome } from "@fortawesome/free-solid-svg-icons/faHome";
import { faTimes } from "@fortawesome/free-solid-svg-icons/faTimes";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import React from "react";
import { Text } from "react-native";
import { TouchableHighlight } from "react-native-gesture-handler";

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
import { Background } from "./components/background";

export function TabNavigation() {
  const Tab = createBottomTabNavigator();

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
        },
        tabBarActiveTintColor: "#F6F5FF",
        tabBarInactiveTintColor: "#4D5070",
      })}
    >
      <Tab.Screen
        name="Assets"
        component={Assets}
        options={{
          headerShown: false,
        }}
      />
      <Tab.Screen name="NFTs" component={Background} />
      <Tab.Screen name="Apps" component={Background} />
      <Tab.Screen name="Trade" component={Background} />
      <Tab.Screen name="Settings" component={Background} />
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
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="Juno" component={TabNavigation} />
      <Drawer.Screen name="Cosmos" component={TabNavigation} />
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
      <Text style={{ color: "#787B9C", marginLeft: 16 }}>Networks</Text>
      {/* <DrawerItem label="Help" onPress={() => alert('Link to help')} /> */}
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}
