import React, { FunctionComponent } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { useStyle } from "../../styles";

export const CardDivider: FunctionComponent<{
  style?: ViewStyle;
}> = ({ style: propStyle }) => {
  const style = useStyle();

  return (
    <View
      style={StyleSheet.flatten([
        style.flatten([
          "height-1",
          "margin-x-card-horizontal",
          "background-color-divider",
        ]),
        propStyle,
      ])}
    />
  );
};
