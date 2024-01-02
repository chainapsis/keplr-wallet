import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const CameraIcon: FunctionComponent<{
  color: string;
  size: number;
}> = ({ color, size }) => {
  return (
    <Svg width={size} height={size} fill="none" viewBox="0 0 24 24">
      <Path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M16.375 22.5h3.063a3.063 3.063 0 003.062-3.063v-3.062m0-8.75V4.562A3.063 3.063 0 0019.437 1.5h-3.062m-8.75 21H4.562A3.063 3.063 0 011.5 19.437v-3.062m0-8.75V4.562A3.062 3.062 0 014.563 1.5h3.062"
      />
    </Svg>
  );
};
