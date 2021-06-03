import React, { FunctionComponent } from "react";
import Svg, { Rect, LinearGradient, Stop, Defs } from "react-native-svg";

type ProgressBarProps = {
  progress: number;
};

export const ProgressBar: FunctionComponent<ProgressBarProps> = ({
  progress,
}) => {
  return (
    <Svg
      height="8px"
      width="100%"
      viewBox="0 0 100 4"
      preserveAspectRatio="none"
    >
      <Defs>
        <LinearGradient id="grad" x1="1" y1="0" x2="0" y2="0">
          <Stop offset="0%" stopColor="#71C4FF" />
          <Stop offset="100%" stopColor="#D378FE" />
        </LinearGradient>
      </Defs>
      <Rect
        rx="1.5"
        ry="1.5"
        x="0"
        y="0"
        width="100"
        height="4"
        fill="#e9ecef"
      />
      <Rect
        rx="1.5"
        ry="1.5"
        x="0"
        y="0"
        width={progress}
        height="4"
        fill="url(#grad)"
      />
    </Svg>
  );
};
