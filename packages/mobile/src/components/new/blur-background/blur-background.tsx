import React, { FunctionComponent } from "react";
import { BlurView } from "expo-blur";
import { ViewStyle } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

export const BlurBackground: FunctionComponent<{
  borderRadius?: number;
  blurIntensity?: number;
  backgroundBlur?: boolean;
  containerStyle?: ViewStyle;
  onPress?: () => void;
  blurType?: "extraLight" | "dark";
}> = ({
  borderRadius = 32,
  blurIntensity = 30,
  backgroundBlur = true,
  blurType = "extraLight",
  containerStyle,
  onPress,
  children,
}) => {
  return onPress ? (
    <TouchableOpacity activeOpacity={0.6} onPress={onPress}>
      <BlurView
        intensity={backgroundBlur ? blurIntensity : 0}
        tint={blurType}
        // blurReductionFactor={1}
        // experimentalBlurMethod="dimezisBlurView"
        style={[
          {
            borderRadius: borderRadius,
            overflow: "hidden",
          },
          containerStyle,
        ]}
      >
        {children}
      </BlurView>
    </TouchableOpacity>
  ) : (
    <BlurView
      intensity={backgroundBlur ? blurIntensity : 0}
      tint={blurType}
      // blurReductionFactor={1}
      // experimentalBlurMethod="dimezisBlurView"
      style={[
        {
          borderRadius: borderRadius,
          overflow: "hidden",
        },
        containerStyle,
      ]}
    >
      {children}
    </BlurView>
  );
};
