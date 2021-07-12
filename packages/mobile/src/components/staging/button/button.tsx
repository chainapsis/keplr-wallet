import React, { FunctionComponent } from "react";
import { useStyle } from "../../../styles";
import { RectButton } from "react-native-gesture-handler";
import { Text } from "react-native-elements";
import { StyleSheet, TextStyle, View, ViewStyle } from "react-native";
import { LoadingSpinner } from "../spinner";

export const Button: FunctionComponent<{
  color?: "primary" | "secondary";
  mode?: "fill" | "outline" | "text";
  size?: "default" | "small" | "large";
  text: string;
  loading?: boolean;
  disabled?: boolean;

  onPress?: () => void;

  containerStyle?: ViewStyle;
  style?: ViewStyle;
  textStyle?: TextStyle;
}> = ({
  color = "primary",
  mode = "fill",
  size = "default",
  text,
  loading = false,
  disabled = false,
  onPress,
  containerStyle,
  style: buttonStyle,
  textStyle,
}) => {
  const style = useStyle();

  const backgroundColorDefinition =
    mode === "fill"
      ? `background-color-button-${color}${disabled ? "-disabled" : ""}`
      : mode === "outline"
      ? "background-color-white"
      : "background-color-transparent";

  const rippleColor = style.get(
    `color-button-${color}-${
      mode === "fill" ? "fill" : "outline"
    }-ripple` as any
  ).color;

  const underlayColor = style.get(
    `color-button-${color}-${
      mode === "fill" ? "fill" : "outline"
    }-underlay` as any
  ).color;

  return (
    <View
      style={StyleSheet.flatten([
        style.flatten(
          [
            backgroundColorDefinition as any,
            `height-button-${size}` as any,
            "border-radius-8",
          ],
          [
            mode === "outline" && "border-width-1",
            mode === "outline" &&
              (`border-color-button-${color}${
                disabled ? "-disabled" : ""
              }` as any),
          ]
        ),
        containerStyle,
      ])}
    >
      <RectButton
        style={StyleSheet.flatten([
          style.flatten(
            [
              "flex",
              "justify-center",
              "items-center",
              "border-radius-8",
              "height-full",
            ],
            [mode !== "fill" && "border-radius-6"]
          ),
          buttonStyle,
        ])}
        onPress={onPress}
        enabled={!loading && !disabled}
        rippleColor={rippleColor}
        underlayColor={underlayColor}
        activeOpacity={1}
      >
        <Text
          style={StyleSheet.flatten([
            style.flatten(
              ["text-button2", "text-center", "color-white"],
              [
                mode !== "fill" &&
                  (`color-button-${color}${
                    disabled ? "-disabled" : ""
                  }` as any),
                size === "large" && "text-button1",
                loading && "display-none",
              ]
            ),
            textStyle,
          ])}
        >
          {text}
        </Text>
        {loading ? (
          <LoadingSpinner
            color={
              mode === "fill"
                ? style.get("color-white").color
                : style.get(
                    `color-button-${color}${disabled ? "-disabled" : ""}` as any
                  ).color
            }
            size={20}
          />
        ) : null}
      </RectButton>
    </View>
  );
};
