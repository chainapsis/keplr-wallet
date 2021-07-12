import React, { FunctionComponent } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { useStyle } from "../../../styles";

export const CardBody: FunctionComponent<{
  style?: ViewStyle;
}> = ({ style: propStyle, children }) => {
  const style = useStyle();

  return (
    <View
      style={StyleSheet.flatten([
        style.flatten(["padding-16", "padding-top-12"]),
        propStyle,
      ])}
    >
      {children}
    </View>
  );
};
