import React, { FunctionComponent } from "react";
import Svg, { Rect } from "react-native-svg";

type ProgressBarProps = {
  progress: number;
};

export const ProgressBar: FunctionComponent<ProgressBarProps> = ({
  progress,
}) => {
  return (
    <Svg
      height="7px"
      width="100%"
      viewBox="0 0 100 4"
      preserveAspectRatio="none"
    >
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
        fill="#5e72e4"
      />
    </Svg>
  );
};
