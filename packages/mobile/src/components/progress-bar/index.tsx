import { StyleSheet, View, ViewStyle } from "react-native";
import React, { FunctionComponent } from "react";
import { useStyle } from "../../styles";

export const ProgressBar: FunctionComponent<{
  progress: number;
}> = ({ progress = 0 }) => {
  const style = useStyle();

  return (
    <View
      style={
        style.flatten([
          "height-8",
          "background-color-gray-50",
          "dark:background-color-platinum-500",
          "border-radius-32",
          "overflow-hidden",
        ]) as ViewStyle
      }
    >
      <View
        style={StyleSheet.flatten([
          style.flatten([
            "height-8",
            "background-color-blue-400",
            "border-radius-32",
          ]) as ViewStyle,
          {
            width: `${progress}%`,
          },
        ])}
      />
    </View>
  );
};
