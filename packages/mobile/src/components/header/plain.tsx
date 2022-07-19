import React, { FunctionComponent } from "react";
import { TransitionPresets } from "@react-navigation/stack";
import { GradientBackground } from "../svg";
import { HeaderLeftBackButton } from "./button";
import { View } from "react-native";
import { useStyle } from "../../styles";

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
    marginLeft: 10,
  },
  headerRightContainerStyle: {
    marginRight: 10,
  },
  // eslint-disable-next-line react/display-name
  headerLeft: (props: any) => <HeaderLeftBackButton {...props} />,
  ...TransitionPresets.SlideFromRightIOS,
};

export const TertiaryBackgroundPlainHeaderScreenOptionsPreset = {
  ...PlainHeaderScreenOptionsPreset,
  // eslint-disable-next-line react/display-name
  headerBackground: () => <HeaderTertiaryBackground />,
};

const HeaderTertiaryBackground: FunctionComponent = () => {
  const style = useStyle();

  return (
    <View
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: style.get("color-background-tertiary").color,
      }}
    />
  );
};

export const getPlainHeaderScreenOptionsPresetWithBackgroundColor = (
  backgroundColor: string
) => {
  return {
    ...PlainHeaderScreenOptionsPreset,
    // eslint-disable-next-line react/display-name
    headerBackground: () => (
      <View style={{ width: "100%", height: "100%", backgroundColor }} />
    ),
  };
};
