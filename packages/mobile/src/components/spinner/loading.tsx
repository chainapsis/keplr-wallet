import React, { FunctionComponent } from "react";
import Svg, { Circle } from "react-native-svg";
import Animated from "react-native-reanimated";
import { useSpinAnimated } from "./hooks";

export const SVGLoadingIcon: FunctionComponent<{
  color: string;
  size: number;
}> = ({ color, size }) => {
  return (
    <Svg width={size} height={size} fill="none" viewBox="0 0 17 17">
      <Circle cx="8.5" cy="1.5" r="1.5" fill={color} />
      <Circle cx="8.5" cy="15.5" r="1.5" fill={color} opacity="0.4" />
      <Circle
        cx="15.5"
        cy="8.5"
        r="1.5"
        fill={color}
        opacity="0.1"
        transform="rotate(90 15.5 8.5)"
      />
      <Circle
        cx="1.5"
        cy="8.5"
        r="1.5"
        fill={color}
        opacity="0.75"
        transform="rotate(90 1.5 8.5)"
      />
      <Circle
        cx="3.55"
        cy="13.45"
        r="1.5"
        fill={color}
        opacity="0.55"
        transform="rotate(45 3.55 13.45)"
      />
      <Circle
        cx="13.45"
        cy="13.45"
        r="1.5"
        fill={color}
        opacity="0.25"
        transform="rotate(135 13.45 13.45)"
      />
      <Circle
        cx="3.551"
        cy="3.55"
        r="1.5"
        fill={color}
        opacity="0.9"
        transform="rotate(135 3.55 3.55)"
      />
    </Svg>
  );
};

export const LoadingSpinner: FunctionComponent<{
  color: string;
  size: number;

  enabled?: boolean;
}> = ({ color, size, enabled }) => {
  const spinAnimated = useSpinAnimated(enabled ?? true);

  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        transform: [
          {
            rotate: spinAnimated,
          },
        ],
      }}
    >
      <SVGLoadingIcon color={color} size={size} />
    </Animated.View>
  );
};
