import React, { FunctionComponent } from "react";
import { StyleSheet, ViewProps } from "react-native";
import { useStyle } from "../../styles";
import { PageWithView } from "./view";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

export const PageWithViewInBottomTabView: FunctionComponent<ViewProps> = (
  props
) => {
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
