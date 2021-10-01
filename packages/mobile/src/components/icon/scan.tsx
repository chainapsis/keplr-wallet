import React, { FunctionComponent } from "react";
import Svg, { Path, Rect } from "react-native-svg";

export const ScanIcon: FunctionComponent<{
  color: string;
  size: number;
}> = ({ color, size }) => {
  return (
    <Svg width={size} height={size} fill="none" viewBox="0 0 28 28">
      <Path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M18.375 24.5h3.063a3.063 3.063 0 003.062-3.063v-3.062m0-8.75V6.562A3.063 3.063 0 0021.437 3.5h-3.062m-8.75 21H6.562A3.063 3.063 0 013.5 21.437v-3.062m0-8.75V6.562A3.062 3.062 0 016.563 3.5h3.062"
      />
      <Rect
        width="11.667"
        height="11.667"
        x="8.167"
        y="8.167"
        stroke={color}
        strokeWidth="2"
        rx="1"
      />
    </Svg>
  );
};
