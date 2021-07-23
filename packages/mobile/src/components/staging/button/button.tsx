import React, { FunctionComponent, useState } from "react";
import { useStyle } from "../../../styles";
import { RectButton } from "react-native-gesture-handler";
import { Text } from "react-native-elements";
import { StyleSheet, TextStyle, View, ViewStyle } from "react-native";
import { LoadingSpinner } from "../spinner";

export const Button: FunctionComponent<{
  color?: "primary" | "secondary" | "danger";
  mode?: "fill" | "light" | "outline" | "text";
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

  const [isPressed, setIsPressed] = useState(false);

  const backgroundColorDefinition = (() => {
    switch (mode) {
      case "fill":
        return `background-color-button-${color}${disabled ? "-disabled" : ""}`;
      case "light":
        if (disabled) {
          return `background-color-button-${color}-disabled`;
        }
        return `background-color-button-${color}-light`;
      case "outline":
        return "background-color-white";
      default:
        return "background-color-transparent";
    }
  })();

  const textColorDefinition = (() => {
    switch (mode) {
      case "fill":
        return "color-white";
      case "light":
        if (disabled) {
          return "color-white";
        }
        if (isPressed) {
          return `color-button-${color}-text-pressed`;
        }
        return `color-${color}`;
      case "outline":
      case "text":
        if (disabled) {
          return `color-button-${color}-disabled`;
        }
        if (isPressed) {
          return `color-button-${color}-text-pressed`;
        }
        return `color-button-${color}`;
    }
  })();

  const rippleColor = (() => {
    switch (mode) {
      case "fill":
        return style.get(`color-button-${color}-fill-ripple` as any).color;
      case "light":
        return style.get(`color-button-${color}-light-ripple` as any).color;
      default:
        return style.get(`color-button-${color}-outline-ripple` as any).color;
    }
  })();

  const underlayColor = (() => {
    switch (mode) {
      case "fill":
        return style.get(`color-button-${color}-fill-underlay` as any).color;
      case "light":
        return style.get(`color-button-${color}-light-underlay` as any).color;
      default:
        return style.get(`color-button-${color}-outline-underlay` as any).color;
    }
  })();

  const outlineBorderDefinition = (() => {
    if (mode !== "outline") {
      return undefined;
    }

    if (disabled) {
      return `border-color-button-${color}-disabled`;
    }
    if (isPressed) {
      return `border-color-button-${color}-text-pressed`;
    }
    return `border-color-button-${color}`;
  })();

  return (
    <View
      style={StyleSheet.flatten([
        style.flatten(
          [
            backgroundColorDefinition as any,
            `height-button-${size}` as any,
            "border-radius-8",
            "overflow-hidden",
          ],
          [
            mode === "outline" && "border-width-1",
            outlineBorderDefinition as any,
          ]
        ),
        containerStyle,
      ])}
    >
      <RectButton
        style={StyleSheet.flatten([
          style.flatten([
            "flex",
            "justify-center",
            "items-center",
            "height-full",
          ]),
          buttonStyle,
        ])}
        onPress={onPress}
        onActiveStateChange={(active) => setIsPressed(active)}
        enabled={!loading && !disabled}
        rippleColor={rippleColor}
        underlayColor={underlayColor}
        activeOpacity={1}
      >
        <Text
          style={StyleSheet.flatten([
            style.flatten(
              ["text-button2", "text-center", textColorDefinition as any],
              [
                size === "large" && "text-button1",
                loading && "opacity-transparent",
              ]
            ),
            textStyle,
          ])}
        >
          {text}
        </Text>
        {loading ? (
          <View
            style={style.flatten([
              "absolute-fill",
              "justify-center",
              "items-center",
            ])}
          >
            <LoadingSpinner
              color={
                mode === "fill" || (mode === "light" && disabled)
                  ? style.get("color-white").color
                  : style.get(
                      `color-button-${color}${
                        disabled ? "-disabled" : ""
                      }` as any
                    ).color
              }
              size={20}
            />
          </View>
        ) : null}
      </RectButton>
    </View>
  );
};
