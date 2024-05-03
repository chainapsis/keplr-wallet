import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const ArrowUpIcon: FunctionComponent<{
  size?: number;
  color?: string;
}> = ({ size = 16, color = "white" }) => {
  return (
    <Svg
      width={size}
      height={size}
      color={color}
      viewBox="0 0 13 14"
      style={{
        width: size,
        height: size,
      }}
      fill="none"
    >
      <Path
        d="M6.78125 0.25L12.0312 5.75C12.3125 6.0625 12.3125 6.53125 12 6.8125C11.6875 7.09375 11.2188 7.09375 10.9375 6.78125L7 2.625V13.25C7 13.6875 6.65625 14 6.25 14C5.8125 14 5.5 13.6875 5.5 13.25V2.625L1.53125 6.78125C1.25 7.09375 0.78125 7.09375 0.46875 6.8125C0.15625 6.53125 0.15625 6.03125 0.4375 5.75L5.6875 0.25C5.84375 0.09375 6.03125 0 6.25 0C6.4375 0 6.625 0.09375 6.78125 0.25Z"
        fill={color}
      />
    </Svg>
  );
};
