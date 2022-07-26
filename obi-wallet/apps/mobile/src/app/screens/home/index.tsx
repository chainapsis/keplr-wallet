import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { faHome } from "@fortawesome/free-solid-svg-icons/faHome";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";

import AppsIcon from "./assets/appsIcon.svg";
import AssetsIcon from "./assets/assetsIcon.svg";
import NFTsIcon from "./assets/nftsIcon.svg";
import SettingsIcon from "./assets/settingsIcon.svg";
import TradeIcon from "./assets/tradeIcon.svg";
import { Assets } from "./components/assets";
import Background from "./components/background";

export function HomeScreen() {
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
              return <AssetsIcon />;
            case "Apps":
              return <AppsIcon />;
            case "NFTs":
              return <NFTsIcon />;
            case "Trade":
              return <TradeIcon />;
            case "Settings":
              return <SettingsIcon />;
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
