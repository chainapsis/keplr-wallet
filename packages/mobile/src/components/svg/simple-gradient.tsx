import React, { FunctionComponent } from "react";
import { Rect, Svg, LinearGradient, Stop, Defs } from "react-native-svg";

export const SimpleGradient: FunctionComponent<{
  direction: "horizontal" | "vertical";
  startColor: string;
  endColor: string;
}> = ({ direction, startColor, endColor }) => {
  return (
    <Svg
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      <Defs>
        <LinearGradient
          id="grad"
          x1={0}
          y1={0}
          x2={direction === "horizontal" ? 1 : 0}
          y2={direction === "horizontal" ? 0 : 1}
        >
          <Stop offset="0%" stopColor={startColor} />
          <Stop offset="100%" stopColor={endColor} />
        </LinearGradient>
      </Defs>
      <Rect width="100" height="100" fill="url(#grad)" />
    </Svg>
  );
};
