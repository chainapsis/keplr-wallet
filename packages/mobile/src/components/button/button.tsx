import React, { FunctionComponent, ReactElement, useState } from "react";
import { useStyle } from "../../styles";
import { Text, StyleSheet, TextStyle, View, ViewStyle } from "react-native";
import { LoadingSpinner } from "../spinner";
import { RectButton } from "../rect-button";

export const Button: FunctionComponent<{
  color?: "primary" | "secondary" | "danger";
  mode?: "fill" | "light" | "outline" | "text";
  size?: "default" | "small" | "large";
  text: string;
  leftIcon?: ReactElement;
  rightIcon?: ReactElement;
  loading?: boolean;
  disabled?: boolean;

  onPress?: () => void;

  containerStyle?: ViewStyle;
  style?: ViewStyle;
  textStyle?: TextStyle;

  rippleColor?: string;
  underlayColor?: string;
}> = ({
  color = "primary",
  mode = "fill",
  size = "default",
  text,
  leftIcon,
  rightIcon,
  loading = false,
  disabled = false,
  onPress,
  containerStyle,
  style: buttonStyle,
  textStyle,
  rippleColor: propRippleColor,
  underlayColor: propUnderlayColor,
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

  const textDefinition = (() => {
    switch (size) {
      case "large":
        return "text-button1";
      case "small":
        return "text-button3";
      default:
        return "text-button2";
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
    if (propRippleColor) {
      return propRippleColor;
    }

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
    if (propUnderlayColor) {
      return propUnderlayColor;
    }

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
            "flex-row",
            "justify-center",
            "items-center",
            "height-full",
            "padding-x-8",
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
        <View
          style={style.flatten(
            ["height-1", "justify-center"],
            [loading && "opacity-transparent"]
          )}
        >
          <View>{leftIcon}</View>
        </View>
        <Text
          style={StyleSheet.flatten([
            style.flatten(
              [textDefinition, "text-center", textColorDefinition as any],
              [loading && "opacity-transparent"]
            ),
            textStyle,
          ])}
        >
          {text}
        </Text>
        <View
          style={style.flatten(
            ["height-1", "justify-center"],
            [loading && "opacity-transparent"]
          )}
        >
          <View>{rightIcon}</View>
        </View>
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
