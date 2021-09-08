import React, { FunctionComponent } from "react";
import { PageWithScrollView } from "./scroll-view";
import { ScrollViewProps, StyleSheet } from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

export const PageWithScrollViewInBottomTabView: FunctionComponent<
  ScrollViewProps & {
    fixed?: React.ReactNode;

    backgroundColor?: string;
  }
> = (props) => {
  const bottomTabBarHeight = useBottomTabBarHeight();

  const { style, ...rest } = props;

  return (
    <PageWithScrollView
      disableSafeArea={true}
      {...rest}
      style={StyleSheet.flatten([{ marginBottom: bottomTabBarHeight }, style])}
    />
  );
};
