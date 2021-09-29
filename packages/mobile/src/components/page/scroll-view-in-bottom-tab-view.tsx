import React, { FunctionComponent } from "react";
import { PageWithScrollView } from "./scroll-view";
import { ScrollViewProps, ScrollView, StyleSheet } from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

export const PageWithScrollViewInBottomTabView: FunctionComponent<
  ScrollViewProps & {
    fixed?: React.ReactNode;
    backgroundColor?: string;
    setScrollViewRef?: React.Dispatch<
      React.SetStateAction<ScrollView | undefined>
    >;
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
