import { StyleSheet, View } from "react-native";
import React, { FunctionComponent } from "react";
import { useStyle } from "../../styles";

export const ProgressBar: FunctionComponent<{
  progress: number;
}> = ({ progress = 0 }) => {
  const style = useStyle();

  return (
    <View
      style={style.flatten([
        "height-8",
        "background-color-border-white",
        "border-radius-32",
        "overflow-hidden",
      ])}
    >
      <View
        style={StyleSheet.flatten([
          style.flatten([
            "height-8",
            "background-color-primary",
            "border-radius-32",
          ]),
          {
            width: `${progress}%`,
          },
        ])}
      />
    </View>
  );
};
