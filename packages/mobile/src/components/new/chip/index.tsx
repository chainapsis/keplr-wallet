import React, { FunctionComponent, ReactElement } from "react";
import { View, Text, ViewStyle, TouchableOpacity } from "react-native";
import { useStyle } from "styles/index";
import { BlurBackground } from "components/new/blur-background/blur-background";

export const ChipButton: FunctionComponent<{
  containerStyle?: ViewStyle;
  textStyle?: ViewStyle;
  backgroundBlur?: boolean;
  blurIntensity?: number;
  text: string;
  iconStyle?: ViewStyle;
  icon?: ReactElement | ((color: string) => ReactElement);
  onPress?: () => void;
}> = ({
  text,
  icon,
  iconStyle,
  containerStyle,
  textStyle,
  blurIntensity,
  backgroundBlur = true,
  onPress,
}) => {
  const style = useStyle();
  return (
    <TouchableOpacity activeOpacity={0.6} onPress={onPress}>
      <BlurBackground
        borderRadius={32}
        blurIntensity={blurIntensity}
        backgroundBlur={backgroundBlur}
        containerStyle={
          [
            style.flatten([
              "flex-row",
              "items-center",
              "justify-center",
              "padding-x-12",
              "padding-y-6",
            ]),
            containerStyle,
          ] as ViewStyle
        }
      >
        <Text
          style={[
            style.flatten(["color-white", "body3"]) as ViewStyle,
            textStyle,
          ]}
        >
          {text}
        </Text>
        <View
          style={[style.flatten(["margin-left-6"]), iconStyle] as ViewStyle}
        >
          {icon}
        </View>
      </BlurBackground>
    </TouchableOpacity>
  );
};
