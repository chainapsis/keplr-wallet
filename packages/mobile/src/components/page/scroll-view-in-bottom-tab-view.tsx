import React from "react";
import { PageWithScrollView } from "./scroll-view";
import {
  ScrollViewProps,
  ScrollView,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { BackgroundMode } from "./background";

// eslint-disable-next-line react/display-name
export const PageWithScrollViewInBottomTabView = React.forwardRef<
  ScrollView,
  React.PropsWithChildren<
    ScrollViewProps & {
      fixed?: React.ReactNode;
      containerStyle?: ViewStyle;

      backgroundMode: BackgroundMode;
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
