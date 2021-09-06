import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const PersonIcon: FunctionComponent<{
  color: string;
  size: number;
}> = ({ color, size }) => {
  return (
    <Svg
      viewBox="0 0 128 128"
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
      }}
    >
      <Path
        fill={color}
        d="M64 27c-12.7 0-23 10.3-23 23s10.3 23 23 23 23-10.3 23-23-10.3-23-23-23zm0 6c9.4 0 17 7.6 17 17s-7.6 17-17 17-17-7.6-17-17 7.6-17 17-17zm0 48c-16.4 0-31.6 8.9-39.7 23.1-.8 1.4-.3 3.3 1.2 4.1.5.3 1 .4 1.5.4 1 0 2.1-.5 2.6-1.5C36.6 94.7 49.8 87 64 87s27.4 7.7 34.5 20.1c.8 1.4 2.7 1.9 4.1 1.1 1.4-.8 1.9-2.7 1.1-4.1C95.6 89.9 80.4 81 64 81z"
      />
    </Svg>
  );
};
