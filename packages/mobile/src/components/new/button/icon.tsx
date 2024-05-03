import React, { FunctionComponent, ReactElement } from "react";
import { Text, View, ViewStyle } from "react-native";
import { BlurBackground } from "components/new/blur-background/blur-background";
import { useStyle } from "styles/index";

export const IconButton: FunctionComponent<{
  containerStyle?: ViewStyle;
  iconStyle?: ViewStyle;
  bottomTextStyle?: ViewStyle;
  icon: ReactElement | undefined;
  bottomText?: string;
  backgroundBlur?: boolean;
  blurIntensity?: number;
  borderRadius?: number;
  onPress?: () => void;
}> = ({
  containerStyle,
  iconStyle,
  bottomTextStyle,
  icon,
  bottomText,
  backgroundBlur,
  blurIntensity = 30,
  borderRadius = 50,
  onPress,
}) => {
  const style = useStyle();
  return (
    <View style={containerStyle}>
      <BlurBackground
        borderRadius={borderRadius}
        backgroundBlur={backgroundBlur}
        blurIntensity={blurIntensity}
        containerStyle={iconStyle}
        onPress={onPress}
      >
        {icon}
      </BlurBackground>
      {bottomText ? (
        <Text
          style={[style.flatten(["color-white"]), bottomTextStyle] as ViewStyle}
        >
          {bottomText}
        </Text>
      ) : null}
    </View>
  );
};
