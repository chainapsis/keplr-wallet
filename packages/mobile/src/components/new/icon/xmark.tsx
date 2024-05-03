import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const XmarkIcon: FunctionComponent<{
  size?: number;
  color?: string;
}> = ({ size = 12, color = "#D0BCFF" }) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      style={{
        width: size,
        height: size,
      }}
      fill="none"
    >
      <Path
        d="M10.6875 2.71875L7.40625 6L10.6875 9.3125C11.0938 9.6875 11.0938 10.3438 10.6875 10.7188C10.3125 11.125 9.65625 11.125 9.28125 10.7188L6 7.4375L2.6875 10.7188C2.3125 11.125 1.65625 11.125 1.28125 10.7188C0.875 10.3438 0.875 9.6875 1.28125 9.3125L4.5625 6L1.28125 2.71875C0.875 2.34375 0.875 1.6875 1.28125 1.3125C1.65625 0.90625 2.3125 0.90625 2.6875 1.3125L6 4.59375L9.28125 1.3125C9.65625 0.90625 10.3125 0.90625 10.6875 1.3125C11.0938 1.6875 11.0938 2.34375 10.6875 2.71875Z"
        fill={color}
      />
    </Svg>
  );
};
