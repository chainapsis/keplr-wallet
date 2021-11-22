import React, { FunctionComponent } from "react";
import { Rect, Svg, LinearGradient, Stop, Defs } from "react-native-svg";
import { useStyle } from "../../styles";

export const GradientBackground: FunctionComponent = () => {
  const style = useStyle();

  const gradientBackground = style.get("gradient-background");

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
          x1={gradientBackground.x1}
          y1={gradientBackground.y1}
          x2={gradientBackground.x2}
          y2={gradientBackground.y2}
        >
          {gradientBackground.stops.map((stop, i) => {
            return (
              <Stop
                key={i.toString()}
                offset={stop.offset}
                stopColor={stop.color}
              />
            );
          })}
        </LinearGradient>
      </Defs>
      <Rect width="100" height="100" fill="url(#grad)" />
    </Svg>
  );
};
