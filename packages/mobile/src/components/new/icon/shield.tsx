import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const ShieldIcon: FunctionComponent<{
  size?: number;
  color?: any;
}> = ({ size = 16, color = "white" }) => {
  return (
    <Svg
      width={size}
      height={size}
      color={color}
      viewBox="0 0 16 16"
      style={{
        width: size,
        height: size,
      }}
      fill="none"
    >
      <Path
        d="M8 1.5625L2.28125 3.96875C2.09375 4.0625 1.96875 4.21875 2 4.375C2 7.25 3.1875 12.1875 7.8125 14.375C7.9375 14.4375 8.0625 14.4375 8.15625 14.375C12.7812 12.1562 13.9688 7.25 14 4.375C14 4.21875 13.875 4.0625 13.7188 3.96875L8 1.5625ZM8.40625 0.09375L14.2812 2.59375C14.9688 2.90625 15.5 3.5625 15.5 4.375C15.4688 7.5 14.1875 13.1562 8.8125 15.75C8.28125 16 7.6875 16 7.15625 15.75C1.78125 13.1562 0.5 7.5 0.5 4.375C0.46875 3.5625 1 2.90625 1.6875 2.59375L7.5625 0.09375C7.6875 0.03125 7.84375 0 8 0C8.125 0 8.28125 0.03125 8.40625 0.09375Z"
        fill={color}
      />
    </Svg>
  );
};
