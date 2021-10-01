import React, { FunctionComponent } from "react";
import Svg, { Path, Rect } from "react-native-svg";

export const CopyIcon: FunctionComponent<{
  color: string;
  size: number;
}> = ({ color, size = 16 }) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 16 17"
      style={{
        width: size,
        height: size,
      }}
    >
      <Path
        d="M11.333 3.833h-6a2 2 0 00-2 2v6"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Rect
        x={5.417}
        y={5.917}
        width={7.833}
        height={7.833}
        rx={1.25}
        stroke={color}
        strokeWidth={1.5}
      />
    </Svg>
  );
};
