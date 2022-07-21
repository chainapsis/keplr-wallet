import { Home } from "@obi-wallet/common";
import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  Button,
  Pressable,
} from "react-native";
import SvgUri from "react-native-svg-uri";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { faHome } from "@fortawesome/free-solid-svg-icons/faHome";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { useNavigation } from "../../stack";
import { useStore } from "../../stores";
import { Assets } from "./components/assets";
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
              return (
                <SvgUri
                  width="24"
                  height="24"
                  source={require("./assets/assetsIcon.svg")}
                />
              );
            // return <Image source={require('./assets/assetsIcon.svg')} />;
            default:
              icon = faChevronLeft;
              break;
          }

          return <FontAwesomeIcon icon={icon} />;
        },
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
      <tab.Screen name="APPs" component={Background} />
      <tab.Screen name="Trade" component={Background} />
      <tab.Screen name="Settings" component={Background} />
    </tab.Navigator>
  );
}
