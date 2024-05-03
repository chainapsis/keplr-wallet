import { RectButton } from "components/rect-button";
import React, { FunctionComponent } from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useStyle } from "styles/index";
import LottieView from "lottie-react-native";

export const GradientButton: FunctionComponent<{
  text: string;
  color1?: string;
  color2?: string;
  containerStyle?: ViewStyle;
  buttonStyle?: ViewStyle;
  textStyle?: ViewStyle;
  loading?: boolean;
  disabled?: boolean;
  rippleColor?: string;
  underlayColor?: string;
  size?: "default" | "small" | "large" | "xlarge";

  onPress?: () => void;
}> = ({
  text,
  color1 = "#F9774B",
  color2 = "#CF447B",
  containerStyle,
  buttonStyle,
  textStyle,
  onPress,
  loading = false,
  disabled = false,
  rippleColor,
  underlayColor,
  size = "default",
}) => {
  const style = useStyle();

  return (
    <LinearGradient
      colors={[color1, color2]}
      start={{ y: 0.0, x: 1.0 }}
      end={{ y: 1.0, x: 0.0 }}
      style={[
        style.flatten([
          `height-button-${size}` as any,
          "overflow-hidden",
          "border-radius-8",
        ]),
        containerStyle,
      ]}
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
        activeOpacity={0.3}
      >
        <Text
          style={
            [
              style.flatten(
                [
                  "text-button1",
                  "text-center",
                  "margin-x-10",
                  "color-white",
                  "background-color-transparent",
                ],
                [loading && "opacity-transparent"]
              ),
              textStyle,
            ] as ViewStyle
          }
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
            <LottieView
              source={require("assets/lottie/loading.json")}
              autoPlay
              loop
              style={style.flatten(["width-24", "height-24"]) as ViewStyle}
            />
          </View>
        ) : null}
      </RectButton>
    </LinearGradient>
  );
};
