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
        style.flatten(["padding-x-16", "padding-y-20"]),
        propStyle,
      ])}
    >
      {children}
    </View>
  );
};
