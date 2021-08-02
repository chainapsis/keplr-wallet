import React, { FunctionComponent } from "react";
import { Rect, Svg, LinearGradient, Stop, Defs } from "react-native-svg";

export const GradientBackground: FunctionComponent = () => {
  return (
    <Svg
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      <Defs>
        <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="2.44%" stopColor="#FBF8FF" />
          <Stop offset="96.83%" stopColor="#F7F8FF" />
        </LinearGradient>
      </Defs>
      <Rect width="100" height="100" fill="url(#grad)" />
    </Svg>
  );
};
