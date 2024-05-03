import React, { FunctionComponent } from "react";
import { StyleSheet, ViewProps } from "react-native";
import { useStyle } from "styles/index";
import { PageWithView } from "./view";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { BackgroundMode } from "./background";

export const PageWithViewInBottomTabView: FunctionComponent<
  ViewProps & {
    backgroundMode: BackgroundMode;
    isTransparentHeader?: boolean;
  }
> = (props) => {
  const style = useStyle();

  const bottomTabBarHeight = useBottomTabBarHeight();

  const { style: propStyle, ...restProps } = props;

  return (
    <PageWithView
      disableSafeArea={true}
      style={StyleSheet.flatten([
        style.flatten(["flex-1"]),
        {
          marginBottom: bottomTabBarHeight,
        },
        propStyle,
      ])}
      {...restProps}
    />
  );
};
