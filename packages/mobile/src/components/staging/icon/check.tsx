import React, { FunctionComponent } from "react";
import Svg, { Rect, Path } from "react-native-svg";

export const CheckIcon: FunctionComponent<{
  width?: number | string;
  height?: number | string;
  color?: string;
}> = ({ width = 16, height = 16, color = "#2DCE89" }) => {
  return (
    <Svg
      viewBox="0 0 16 16"
      width={width}
      height={height}
      style={{
        width,
        height,
      }}
    >
      <Rect width={width} height={height} rx={8} fill={color} />
      <Path
        d="M4 7.182L7.111 11 12 5"
        stroke="#fff"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
