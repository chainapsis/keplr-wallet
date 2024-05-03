import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const StakeIcon: FunctionComponent<{
  size?: number;
  color?: string;
}> = ({ size = 16, color = "white" }) => {
  return (
    <Svg
      width={size}
      height={size}
      color={color}
      viewBox="0 0 17 16"
      style={{
        width: size,
        height: size,
      }}
      fill="none"
    >
      <Path
        d="M9.84375 6.46875C12.4375 6.1875 14.4688 4.125 14.7188 1.5H14.5C12.0938 1.5 10.0625 3.0625 9.28125 5.1875C9.03125 4.65625 8.6875 4.15625 8.3125 3.71875C9.5 1.5 11.8125 0 14.5 0H15.25C15.7812 0 16.25 0.46875 16.25 1C16.25 4.5625 13.5938 7.5 10.1562 7.9375C10.0938 7.4375 10 6.96875 9.84375 6.46875ZM1.75 3.5V4C1.75 7.0625 4.1875 9.5 7.25 9.5H7.5V9C7.5 5.96875 5.03125 3.5 2 3.5H1.75ZM9 9V9.5V11V15.25C9 15.6875 8.65625 16 8.25 16C7.8125 16 7.5 15.6875 7.5 15.25V11H7.25C3.375 11 0.25 7.875 0.25 4V3C0.25 2.46875 0.6875 2 1.25 2H2C5.84375 2 9 5.15625 9 9Z"
        fill={color}
      />
    </Svg>
  );
};
