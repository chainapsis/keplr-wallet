import React, { FunctionComponent } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { useStyle } from "../../styles";

export const Dot: FunctionComponent<{
  size: number;
  color: string;
  containerStyle?: ViewStyle;
}> = ({ size, color, containerStyle }) => {
  const style = useStyle();

  return (
    <View
      style={StyleSheet.flatten([
        style.flatten(["justify-center"]),
        containerStyle,
      ])}
    >
      <View
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: size,
        }}
      />
    </View>
  );
};
