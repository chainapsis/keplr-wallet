import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { faHome } from "@fortawesome/free-solid-svg-icons/faHome";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { useNavigation } from "../../stack";
import { useStore } from "../../stores";
import { Assets } from "./components/assets";
import AssetsIcon from "./assets/assetsIcon.svg";
import AppsIcon from "./assets/appsIcon.svg";
import NFTsIcon from "./assets/nftsIcon.svg";
import TradeIcon from "./assets/tradeIcon.svg";
import SettingsIcon from "./assets/settingsIcon.svg";
import Background from "./components/background";

export function HomeScreen() {
  const { appsStore } = useStore();
  const navigation = useNavigation();
  const tab = createBottomTabNavigator();

  return (
    <tab.Navigator
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
      <tab.Screen
        name="Assets"
        component={Assets}
        options={{
          headerShown: false,
        }}
      />
      <tab.Screen name="NFTs" component={Background} />
      <tab.Screen name="Apps" component={Background} />
      <tab.Screen name="Trade" component={Background} />
      <tab.Screen name="Settings" component={Background} />
    </tab.Navigator>
  );
}
