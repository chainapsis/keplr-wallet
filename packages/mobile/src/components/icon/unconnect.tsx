import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const UnconnectIcon: FunctionComponent<{
  color: string;
  height: number;
}> = ({ color, height }) => {
  return (
    <Svg
      viewBox="0 0 24 25"
      fill="none"
      style={{
        height,
        aspectRatio: 24 / 25,
      }}
    >
      <Path
        d="M8.496 9.509H6.629A3.63 3.63 0 003 13.138v0a3.63 3.63 0 003.63 3.63h1.866M14.636 16.538l1.588.982a3.63 3.63 0 004.995-1.178v0a3.63 3.63 0 00-1.177-4.995l-1.588-.982M9.097 13.187h6.436"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
};
