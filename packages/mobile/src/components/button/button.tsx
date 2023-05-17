import React, { FunctionComponent, ReactElement, isValidElement } from "react";
import { useStyle } from "../../styles";
import { Text, StyleSheet, TextStyle, View, ViewStyle } from "react-native";
import { LoadingSpinner } from "../spinner";
import { RectButton } from "../rect-button";

export const Button: FunctionComponent<{
  color?: "primary" | "danger";
  mode?: "fill" | "light" | "outline" | "text";
  size?: "default" | "small" | "large";
  text: string;
  leftIcon?: ReactElement | ((color: string) => ReactElement);
  rightIcon?: ReactElement | ((color: string) => ReactElement);
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
              `background-color-${baseColor}-200`,
              `dark:background-color-${baseColor}-600`,
            ];
          } else {
            return [
              `background-color-${baseColor}-100`,
              `dark:background-color-${baseColor}-700`,
            ];
          }
        } else {
          return [`background-color-${baseColor}-400`];
        }
      case "light":
        if (disabled) {
          if (color === "primary") {
            return [
              `background-color-${baseColor}-50`,
              "dark:background-color-platinum-500",
            ];
          } else {
            return [
              `background-color-${baseColor}-100`,
              `dark:background-color-${baseColor}-700`,
            ];
          }
        } else {
          return [
            `background-color-${baseColor}-100`,
            color === "primary"
              ? "dark:background-color-platinum-400"
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
            return ["color-white", "dark:color-platinum-200"];
          } else {
            return [`color-${baseColor}-200`, `dark:color-${baseColor}-500`];
          }
        }

        if (color === "primary") {
          return ["color-white", `dark:color-${baseColor}-50`];
        } else {
          return ["color-white"];
        }
      case "light":
        if (disabled) {
          if (color === "primary") {
            return [`color-${baseColor}-200`, "dark:color-platinum-200"];
          } else {
            return [`color-${baseColor}-200`, `dark:color-${baseColor}-500`];
          }
        }

        return [
          `color-${baseColor}-400`,
          color === "primary"
            ? "dark:color-platinum-10"
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

        if (color === "primary") {
          return [`color-${baseColor}-400`, "dark:color-platinum-50"];
        } else {
          return [`color-${baseColor}-400`, `dark:color-${baseColor}-300`];
        }
    }
  })();

  const rippleColor = (() => {
    if (propRippleColor) {
      return propRippleColor;
    }

    const baseColor = color === "primary" ? "blue" : "red";

    switch (mode) {
      case "fill":
        return style.get(`color-${baseColor}-500` as any).color;
      case "light":
        if (color === "primary") {
          return (style.flatten([
            `color-${baseColor}-200`,
            "dark:color-platinum-600",
          ] as any) as any).color;
        }
        return style.get(`color-${baseColor}-200` as any).color;
      default:
        if (color === "primary") {
          return (style.flatten([
            `color-${baseColor}-100`,
            "dark:color-platinum-300",
          ] as any) as any).color;
        }
        return (style.flatten([
          `color-${baseColor}-100`,
          `dark:color-${baseColor}-600`,
        ] as any) as any).color;
    }
  })();

  const underlayColor = (() => {
    if (propUnderlayColor) {
      return propUnderlayColor;
    }

    if (mode === "text" || mode === "outline") {
      const baseColor = color === "primary" ? "blue" : "red";

      if (color === "primary") {
        return (style.flatten([
          `color-${baseColor}-200`,
          "dark:color-platinum-300",
        ] as any) as any).color;
      }
      return (style.flatten([
        `color-${baseColor}-200`,
        `dark:color-${baseColor}-600`,
      ] as any) as any).color;
    }

    if (mode === "light" && color === "primary") {
      return style.flatten(["color-gray-200", "dark:color-platinum-600"]).color;
    }

    if (color === "primary") {
      return style.get("color-platinum-600").color;
    } else {
      return style.get("color-platinum-500").color;
    }
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
        activeOpacity={propUnderlayColor ? 1 : color === "primary" ? 0.3 : 0.2}
      >
        <View
          style={style.flatten(
            ["height-1", "justify-center"],
            [loading && "opacity-transparent"]
          )}
        >
          <View>
            {isValidElement(leftIcon) || !leftIcon
              ? leftIcon
              : leftIcon(
                  (style.flatten(textColorDefinition as any) as any).color
                )}
          </View>
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
          <View>
            {isValidElement(rightIcon) || !rightIcon
              ? rightIcon
              : rightIcon(
                  (style.flatten(textColorDefinition as any) as any).color
                )}
          </View>
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
