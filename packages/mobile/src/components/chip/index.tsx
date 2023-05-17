import React, { FunctionComponent } from "react";
import { useStyle } from "../../styles";
import { Text, View } from "react-native";

export const Chip: FunctionComponent<{
  color?: "primary" | "danger";
  mode?: "fill" | "light" | "outline";
  text: string;
}> = ({ color = "primary", mode = "fill", text }) => {
  const style = useStyle();

  const baseColor = color === "primary" ? "blue" : "red";

  const backgroundColorDefinition = (() => {
    switch (mode) {
      case "fill":
        return [`background-color-${baseColor}-400`];
      case "light":
        if (color === "primary") {
          return [
            `background-color-${baseColor}-100`,
            "dark:background-color-platinum-500",
          ];
        } else {
          return [
            `background-color-${baseColor}-100`,
            `dark:background-color-${baseColor}-700`,
          ];
        }
      case "outline":
        return ["background-color-transparent"];
    }
  })();

  const textColorDefinition = (() => {
    switch (mode) {
      case "fill":
        return ["color-white"];
      case "light":
        if (color === "primary") {
          return [`color-${baseColor}-400`, `dark:color-white`];
        } else {
          return [`color-${baseColor}-400`, `dark:color-${baseColor}-200`];
        }
      case "outline":
        return [`color-${baseColor}-400`];
    }
  })();

  return (
    <View
      style={style.flatten(
        [
          ...(backgroundColorDefinition as any),
          "padding-x-8",
          "padding-y-2",
          "border-radius-32",
          "justify-center",
          "items-center",
        ],
        [
          mode === "outline" && "border-width-1",
          mode === "outline" && (`border-color-${baseColor}-400` as any),
        ]
      )}
    >
      <Text
        style={style.flatten([
          "text-overline",
          "text-center",
          ...(textColorDefinition as any),
        ])}
      >
        {text}
      </Text>
    </View>
  );
};
