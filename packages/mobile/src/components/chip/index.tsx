import React, { FunctionComponent } from "react";
import { useStyle } from "../../styles";
import { Text, View } from "react-native";

export const Chip: FunctionComponent<{
  color?: "primary" | "secondary" | "danger";
  mode?: "fill" | "light" | "outline";
  text: string;
}> = ({ color = "primary", mode = "fill", text }) => {
  const style = useStyle();

  const backgroundColorDefinition = (() => {
    switch (mode) {
      case "fill":
        return `background-color-${color}`;
      case "light":
        return `background-color-chip-light-${color}`;
      case "outline":
        return "background-color-transparent";
    }
  })();

  const textColorDefinition = (() => {
    switch (mode) {
      case "fill":
        return "color-white";
      case "outline":
      case "light":
        return `color-${color}`;
    }
  })();

  return (
    <View
      style={style.flatten(
        [
          backgroundColorDefinition as any,
          "padding-x-8",
          "padding-y-2",
          "border-radius-32",
          "justify-center",
          "items-center",
        ],
        [
          mode === "outline" && "border-width-1",
          mode === "outline" && (`border-color-${color}` as any),
        ]
      )}
    >
      <Text
        style={style.flatten([
          "text-overline",
          "text-center",
          textColorDefinition as any,
        ])}
      >
        {text}
      </Text>
    </View>
  );
};
