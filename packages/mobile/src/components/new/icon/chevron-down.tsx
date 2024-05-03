import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const ChevronDownIcon: FunctionComponent<{
  size?: number;
  color?: string;
}> = ({ size = 14, color = "white" }) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 12 4"
      style={{
        width: size,
        height: size,
      }}
      fill="none"
    >
      <Path
        d="M5.46094 6.03906L0.960938 1.53906C0.65625 1.25781 0.65625 0.765625 0.960938 0.484375C1.24219 0.179688 1.73438 0.179688 2.01562 0.484375L6 4.44531L9.96094 0.484375C10.2422 0.179688 10.7344 0.179688 11.0156 0.484375C11.3203 0.765625 11.3203 1.25781 11.0156 1.53906L6.51562 6.03906C6.23438 6.34375 5.74219 6.34375 5.46094 6.03906Z"
        fill={color}
      />
    </Svg>
  );
};
