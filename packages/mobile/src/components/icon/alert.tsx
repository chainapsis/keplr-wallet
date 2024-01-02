import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const AlertIcon: FunctionComponent<{
  color: string;
  size: number;
}> = ({ color, size = 24 }) => {
  return (
    <Svg
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 24 24"
      style={{
        width: size,
        height: size,
      }}
    >
      <Path
        d="M21 12c0-4.969-4.031-9-9-9s-9 4.031-9 9 4.031 9 9 9 9-4.031 9-9z"
        stroke={color}
        strokeWidth={1.5}
        strokeMiterlimit={10}
      />
      <Path
        d="M11.669 7.279l.269 5.719.268-5.717A.269.269 0 0011.935 7v0a.269.269 0 00-.266.279v0z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M11.938 16.741a.937.937 0 110-1.875.937.937 0 010 1.875z"
        fill={color}
      />
    </Svg>
  );
};
