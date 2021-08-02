import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const PlusIcon: FunctionComponent<{
  color: string;
  size: number;
}> = ({ color, size }) => {
  return (
    <Svg
      viewBox="0 0 18 18"
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
      }}
    >
      <Path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M17 9H1m8-8v16V1z"
      />
    </Svg>
  );
};
