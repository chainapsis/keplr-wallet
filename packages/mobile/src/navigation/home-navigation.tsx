import React, { FunctionComponent } from "react";
import { TransitionPresets } from "@react-navigation/stack";
import { TransparentHeaderOptionsPreset } from "components/header";
import { NewHomeScreen } from "screens/home/new";
import { PortfolioScreen } from "screens/portfolio";
import { Stack } from "./navigation";
import { InboxScreen } from "screens/inbox";

export const HomeNavigation: FunctionComponent = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        ...TransitionPresets.SlideFromRightIOS,
        headerMode: "screen",
      }}
      initialRouteName="Home"
    >
      <Stack.Screen
        options={{
          ...TransparentHeaderOptionsPreset,
          headerShown: false,
        }}
        name="Home"
        component={NewHomeScreen}
      />
      <Stack.Screen
        options={{
          ...TransparentHeaderOptionsPreset,
          // Only show the back button.
          title: "",
        }}
        name="Portfolio"
        component={PortfolioScreen}
      />
      <Stack.Screen
        options={{
          ...TransparentHeaderOptionsPreset,
          title: "",
        }}
        name="Inbox"
        component={InboxScreen}
      />
    </Stack.Navigator>
  );
};
