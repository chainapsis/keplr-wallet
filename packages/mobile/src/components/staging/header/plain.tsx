import React from "react";
import { TransitionPresets } from "@react-navigation/stack";
import { GradientBackground } from "../../svg";
import { HeaderBackButton } from "./back-button";

export const PlainHeaderScreenOptionsPreset = {
  headerTitleAlign: "center" as "left" | "center",
  headerStyle: {
    backgroundColor: "transparent",
    elevation: 0,
    shadowOpacity: 0,
  },
  // eslint-disable-next-line react/display-name
  headerBackground: () => <GradientBackground />,
  headerBackTitleVisible: false,
  header: undefined,
  headerLeftContainerStyle: {
    marginLeft: 24,
  },
  headerRightContainerStyle: {
    marginRight: 24,
  },
  // eslint-disable-next-line react/display-name
  headerBackImage: () => <HeaderBackButton />,
  ...TransitionPresets.SlideFromRightIOS,
};
