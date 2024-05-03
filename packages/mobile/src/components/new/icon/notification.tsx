import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const NotificationIcon: FunctionComponent<{
  size?: number;
  color?: string;
}> = ({ size = 16, color = "white" }) => {
  return (
    <Svg
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
      }}
      viewBox="0 0 16 17"
      fill="none"
    >
      <Path
        d="M5 11.5C5.8125 11.5 6.5 12.1875 6.5 13V13.5L8.75 11.8125C9 11.625 9.3125 11.5 9.65625 11.5H14C14.25 11.5 14.5 11.2812 14.5 11V2C14.5 1.75 14.25 1.5 14 1.5H2C1.71875 1.5 1.5 1.75 1.5 2V11C1.5 11.2812 1.71875 11.5 2 11.5H5ZM6.5 15.375L6.46875 15.4062L6.3125 15.5L5.78125 15.9062C5.625 16.0312 5.4375 16.0312 5.25 15.9688C5.09375 15.875 5 15.7188 5 15.5V14.8438V14.6562V14.625V14.5V13H3.5H2C0.875 13 0 12.125 0 11V2C0 0.90625 0.875 0 2 0H14C15.0938 0 16 0.90625 16 2V11C16 12.125 15.0938 13 14 13H9.65625L6.5 15.375Z"
        fill={color}
      />
    </Svg>
  );
};
