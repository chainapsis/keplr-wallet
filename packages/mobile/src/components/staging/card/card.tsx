import React, { FunctionComponent } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { useStyle } from "../../../styles";

export const Card: FunctionComponent<{
  style?: ViewStyle;
}> = ({ style: propStyle, children }) => {
  const style = useStyle();

  return (
    <View
      style={StyleSheet.flatten([
        style.flatten([
          "width-full",
          "background-color-card",
          "border-radius-8",
          "border-width-1",
          "border-color-border-white",
        ]),
        propStyle,
      ])}
    >
      {children}
    </View>
  );
};
