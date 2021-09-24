import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const RefreshIcon: FunctionComponent<{
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
        d="M19.245 12.313a7.821 7.821 0 11-2.117-5.351"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M18.266 4.098l.048 4.097-4.097-.52 4.05-3.577z"
        fill={color}
        stroke={color}
      />
    </Svg>
  );
};
