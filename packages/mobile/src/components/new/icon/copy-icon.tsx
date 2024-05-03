import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const CopyIcon: FunctionComponent<{
  size?: number;
  color?: string;
  iconOpacity?: number;
}> = ({ size = 16, color = "white", iconOpacity = 0.6 }) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 14 17"
      style={{
        width: size,
        height: size,
      }}
      fill="none"
    >
      <Path
        opacity={iconOpacity}
        d="M12 10.5C12.25 10.5 12.5 10.2812 12.5 10V3.625L10.375 1.5H6C5.71875 1.5 5.5 1.75 5.5 2V10C5.5 10.2812 5.71875 10.5 6 10.5H12ZM6 12C4.875 12 4 11.125 4 10V2C4 0.90625 4.875 0 6 0H10.375C10.75 0 11.1562 0.1875 11.4375 0.46875L13.5312 2.5625C13.8125 2.84375 14 3.25 14 3.625V10C14 11.125 13.0938 12 12 12H6ZM2 4H3V5.5H2C1.71875 5.5 1.5 5.75 1.5 6V14C1.5 14.2812 1.71875 14.5 2 14.5H8C8.25 14.5 8.5 14.2812 8.5 14V13H10V14C10 15.125 9.09375 16 8 16H2C0.875 16 0 15.125 0 14V6C0 4.90625 0.875 4 2 4Z"
        fill={color}
      />
    </Svg>
  );
};
