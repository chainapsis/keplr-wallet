import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const FilterIcon: FunctionComponent<{
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
      viewBox="0 0 16 10"
      fill="none"
    >
      <Path
        d="M11 1.5H10C9.71875 1.5 9.5 1.75 9.5 2V8C9.5 8.28125 9.71875 8.5 10 8.5H11C11.25 8.5 11.5 8.28125 11.5 8V2C11.5 1.75 11.25 1.5 11 1.5ZM10 0H11C12.0938 0 13 0.90625 13 2V4.25H15.25C15.6562 4.25 16 4.59375 16 5C16 5.4375 15.6562 5.75 15.25 5.75H13V8C13 9.125 12.0938 10 11 10H10C8.875 10 8 9.125 8 8V2C8 0.90625 8.875 0 10 0ZM0 5C0 4.59375 0.3125 4.25 0.75 4.25H7V5.75H0.75C0.3125 5.75 0 5.4375 0 5Z"
        fill={color}
      />
    </Svg>
  );
};
