import React, { FunctionComponent, ReactElement } from "react";
import { useStyle } from "../../styles";
import { Text, StyleSheet, TextStyle, View, ViewStyle } from "react-native";
import { LoadingSpinner } from "../spinner";
import { RectButton } from "../rect-button";

export const Button: FunctionComponent<{
  color?: "primary" | "danger";
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

  const backgroundColorDefinitions: string[] = (() => {
    const baseColor = color === "primary" ? "blue" : "red";

    switch (mode) {
      case "fill":
        if (disabled) {
          if (color === "primary") {
            return [
              "background-color-gray-50",
              "dark:background-color-platinum-400",
            ];
          } else {
            return [
              "background-color-red-100",
              "dark:background-color-red-700",
            ];
          }
        } else {
          return [`background-color-${baseColor}-400`];
        }
      case "light":
        if (disabled) {
          if (color === "primary") {
            return [
              "background-color-gray-50",
              "dark:background-color-platinum-500",
            ];
          } else {
            return [
              "background-color-red-100",
              "dark:background-color-red-700",
            ];
          }
        } else {
          return [
            `background-color-${baseColor}-100`,
            color === "primary"
              ? "dark:background-color-platinum-500"
              : `dark:background-color-${baseColor}-600`,
          ];
        }
      case "outline":
        return ["background-color-transparent"];
      default:
        return ["background-color-transparent"];
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

  const textColorDefinition: string[] = (() => {
    const baseColor = color === "primary" ? "blue" : "red";

    switch (mode) {
      case "fill":
        if (disabled) {
          if (color === "primary") {
            return ["color-gray-300", "dark:color-platinum-200"];
          } else {
            return [`color-${baseColor}-200`, `dark:color-${baseColor}-500`];
          }
        }

        if (color === "primary") {
          return ["color-white", "dark:color-blue-100"];
        } else {
          return ["color-white"];
        }
      case "light":
        if (disabled) {
          if (color === "primary") {
            return ["color-gray-300", "dark:color-platinum-300"];
          } else {
            return [`color-${baseColor}-200`, `dark:color-${baseColor}-500`];
          }
        }

        return [
          `color-${baseColor}-400`,
          color === "primary"
            ? "dark:color-platinum-50"
            : `dark:color-${baseColor}-50`,
        ];
      case "outline":
        if (disabled) {
          return [`color-${baseColor}-200`, `dark:color-${baseColor}-600`];
        }

        return [`color-${baseColor}-400`];
      case "text":
        if (disabled) {
          if (color === "primary") {
            return ["color-gray-200", "dark:color-platinum-300"];
          } else {
            return [`color-${baseColor}-200`, `dark:color-${baseColor}-600`];
          }
        }

        return [`color-${baseColor}-400`, `dark:color-${baseColor}-300`];
    }
  })();

  const rippleColor = (() => {
    if (propRippleColor) {
      return propRippleColor;
    }

    // TODO
    return "#FFFFFF";

    // switch (mode) {
    //   case "fill":
    //     return style.get(`color-button-${color}-fill-ripple` as any).color;
    //   case "light":
    //     return style.get(`color-button-${color}-light-ripple` as any).color;
    //   default:
    //     return style.get(`color-button-${color}-outline-ripple` as any).color;
    // }
  })();

  const underlayColor = (() => {
    if (propUnderlayColor) {
      return propUnderlayColor;
    }

    // TODO
    return "#FFFFFF";

    // switch (mode) {
    //   case "fill":
    //     return style.get(`color-button-${color}-fill-underlay` as any).color;
    //   case "light":
    //     return style.get(`color-button-${color}-light-underlay` as any).color;
    //   default:
    //     return style.get(`color-button-${color}-outline-underlay` as any).color;
    // }
  })();

  const outlineBorderDefinition: string[] = (() => {
    if (mode !== "outline") {
      return [];
    }

    const baseColor = color === "primary" ? "blue" : "red";

    if (disabled) {
      return [
        `border-color-${baseColor}-200`,
        `dark:border-color-${baseColor}-600`,
      ];
    }

    return [`border-color-${baseColor}-400`];
  })();

  return (
    <View
      style={StyleSheet.flatten([
        style.flatten(
          [
            ...(backgroundColorDefinitions as any),
            `height-button-${size}` as any,
            "border-radius-8",
            "overflow-hidden",
          ],
          [
            mode === "outline" && "border-width-1",
            ...(outlineBorderDefinition as any),
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
              [textDefinition, "text-center", ...(textColorDefinition as any)],
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
                // TODO: Color for loading spinner in button is not yet determined.
                style.flatten([...(textColorDefinition as any)]).color
              }
              size={20}
            />
          </View>
        ) : null}
      </RectButton>
    </View>
  );
};
