import React from "react";
import { PageWithScrollView } from "./scroll-view";
import { ScrollViewProps, ScrollView, StyleSheet } from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

// eslint-disable-next-line react/display-name
export const PageWithScrollViewInBottomTabView = React.forwardRef<
  ScrollView,
  React.PropsWithChildren<
    ScrollViewProps & {
      fixed?: React.ReactNode;
      backgroundColor?: string;
    }
  >
>((props, ref) => {
  const bottomTabBarHeight = useBottomTabBarHeight();

  const { style, ...rest } = props;

  return (
    <PageWithScrollView
      disableSafeArea={true}
      {...rest}
      style={StyleSheet.flatten([{ marginBottom: bottomTabBarHeight }, style])}
      ref={ref}
    />
  );
});
