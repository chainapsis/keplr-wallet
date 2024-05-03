import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const CheckIcon: FunctionComponent<{
  size?: number;
  color?: string;
}> = ({ size = 18, color = "#D0BCFF" }) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 16 12"
      style={{
        width: size,
        height: size,
      }}
      fill="none"
    >
      <Path
        d="M14.6875 1.3125C15.0938 1.6875 15.0938 2.34375 14.6875 2.71875L6.6875 10.7188C6.3125 11.125 5.65625 11.125 5.28125 10.7188L1.28125 6.71875C0.875 6.34375 0.875 5.6875 1.28125 5.3125C1.65625 4.90625 2.3125 4.90625 2.6875 5.3125L6 8.59375L13.2812 1.3125C13.6562 0.90625 14.3125 0.90625 14.6875 1.3125Z"
        fill={color}
      />
    </Svg>
  );
};
