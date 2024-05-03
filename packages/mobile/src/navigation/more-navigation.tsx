import React, { FunctionComponent } from "react";
import { useStyle } from "styles/index";
import {
  NavigationProp,
  ParamListBase,
  useNavigation,
} from "@react-navigation/native";
import { useStore } from "stores/index";
import { TransitionPresets } from "@react-navigation/stack";
import {
  HeaderOnSecondaryScreenOptionsPreset,
  HeaderRightButton,
} from "components/header";
import { SettingScreen } from "screens/setting";
import { HeaderAddIcon } from "components/header/icon";
import { SettingSelectAccountScreen } from "screens/setting/screens/select-account";
import { Stack } from "./navigation";

export const MoreNavigation: FunctionComponent = () => {
  const style = useStyle();

  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  const { analyticsStore } = useStore();

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
          headerShown: false,
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
    </Stack.Navigator>
  );
};
