import React, { FunctionComponent, ReactElement, isValidElement } from "react";
import { Text, StyleSheet, TextStyle, View, ViewStyle } from "react-native";
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Text as TextSvg,
} from "react-native-svg";
import { useStyle } from "styles/index";
import { RectButton } from "components/rect-button";
import LottieView from "lottie-react-native";

export const Button: FunctionComponent<{
  color?: "primary" | "danger" | "gradient";
  mode?: "fill" | "light" | "outline" | "text";
  size?: "default" | "small" | "large" | "xlarge";
  text: string;
  leftIcon?: ReactElement | ((color: string) => ReactElement);
  rightIcon?: ReactElement | ((color: string) => ReactElement);
  loading?: boolean;
  loaderColor?: string;
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
    const baseColor = color === "primary" ? "white" : "red";

    switch (mode) {
      case "fill":
        if (disabled) {
          if (color === "primary") {
            return [
              "background-color-transparent",
              "border-color-white@20%",
              "border-width-1",
            ];
          } else {
            return [`background-color-${baseColor}-300`];
          }
        } else {
          return [`background-color-${baseColor}`];
        }
      case "light":
        if (disabled) {
          if (color === "primary") {
            return [`background-color-${baseColor}-50`];
          } else {
            return [`background-color-${baseColor}-100`];
          }
        } else {
          return [`background-color-${baseColor}-100`];
        }
      case "outline":
        return ["background-color-transparent", "border-color-gray-200"];
      default:
        return ["background-color-transparent"];
    }
  })();

  const textDefinition = (() => {
    switch (size) {
      case "xlarge":
        return "text-button0";
      case "large":
        return "text-button1";
      case "small":
        return "text-caption2";
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
            return ["color-white@20%"];
          } else {
            return [`color-${baseColor}-200`];
          }
        }

        if (color === "primary") {
          return ["color-indigo-900"];
        } else {
          return ["color-indigo-900"];
        }
      case "light":
        if (disabled) {
          if (color === "primary") {
            return [`color-${baseColor}-200`];
          } else {
            return [`color-${baseColor}-200`];
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
          return [`color-${baseColor}-200`];
        }

        return [`color-${baseColor}-400`];
      case "text":
        if (disabled) {
          if (color === "primary") {
            return ["color-gray-200"];
          } else {
            return [`color-${baseColor}-200`];
          }
        }

        if (color === "primary") {
          return [`color-${baseColor}-400`];
        } else {
          return [`color-${baseColor}-400`];
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
          return (
            style.flatten([
              `color-${baseColor}-200`,
              "dark:color-platinum-600",
            ] as any) as any
          ).color;
        }
        return style.get(`color-${baseColor}-200` as any).color;
      default:
        if (color === "primary") {
          return (
            style.flatten([
              `color-${baseColor}-100`,
              "dark:color-platinum-300",
            ] as any) as any
          ).color;
        }
        return (
          style.flatten([
            `color-${baseColor}-100`,
            `dark:color-${baseColor}-600`,
          ] as any) as any
        ).color;
    }
  })();

  const underlayColor = (() => {
    if (propUnderlayColor) {
      return propUnderlayColor;
    }

    if (mode === "text" || mode === "outline") {
      const baseColor = color === "primary" ? "blue" : "red";

      if (color === "primary") {
        return (
          style.flatten([
            `color-${baseColor}-200`,
            "dark:color-platinum-300",
          ] as any) as any
        ).color;
      }
      return (
        style.flatten([
          `color-${baseColor}-200`,
          `dark:color-${baseColor}-600`,
        ] as any) as any
      ).color;
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
          ]) as ViewStyle,
          buttonStyle,
        ])}
        onPress={onPress}
        enabled={!loading && !disabled}
        rippleColor={rippleColor}
        underlayColor={underlayColor}
        activeOpacity={propUnderlayColor ? 1 : color === "primary" ? 0.3 : 0.2}
      >
        <View
          style={
            style.flatten(
              ["height-1", "justify-center"],
              [loading && "opacity-transparent"]
            ) as ViewStyle
          }
        >
          <View>
            {isValidElement(leftIcon) || !leftIcon
              ? leftIcon
              : leftIcon(
                  (style.flatten(textColorDefinition as any) as any).color
                )}
          </View>
        </View>
        {color === "gradient" ? (
          <Svg
            width="100%"
            height="26"
            style={StyleSheet.flatten([
              style.flatten(
                [
                  textDefinition,
                  "text-center",
                  ...(textColorDefinition as any),
                ],
                [loading && "opacity-transparent"]
              ),
              textStyle,
            ])}
          >
            <Defs>
              <LinearGradient
                id="customGradient"
                x1="37.86%"
                y1="0%"
                x2="78.96%"
                y2="100%"
              >
                <Stop offset="0%" stopColor="#0B1742" />
                <Stop offset="100%" stopColor="#F9774B" />
              </LinearGradient>
            </Defs>
            <TextSvg
              x="50%"
              y="70%"
              textAnchor="middle"
              fill="url(#customGradient)"
            >
              {text}
            </TextSvg>
          </Svg>
        ) : (
          <Text
            style={StyleSheet.flatten([
              style.flatten(
                [
                  textDefinition,
                  "text-center",
                  ...(textColorDefinition as any),
                ],
                [loading && "opacity-transparent"]
              ),
              textStyle,
            ])}
          >
            {text}
          </Text>
        )}

        <View
          style={
            style.flatten(
              ["height-1", "justify-center"],
              [loading && "opacity-transparent"]
            ) as ViewStyle
          }
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
            <LottieView
              source={require("assets/lottie/loading.json")}
              autoPlay
              loop
              style={style.flatten(["width-24", "height-24"]) as ViewStyle}
            />
          </View>
        ) : null}
      </RectButton>
    </View>
  );
};
