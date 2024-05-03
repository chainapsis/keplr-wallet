import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const LeftBackIcon: FunctionComponent<{
  size?: number;
  color?: string;
}> = ({ size = 12, color = "white" }) => {
  return (
    <Svg
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
      }}
      viewBox="0 0 8 11"
      fill="none"
    >
      <Path
        d="M1.21094 4.98438L5.71094 0.484375C5.99219 0.179688 6.48438 0.179688 6.76562 0.484375C7.07031 0.765625 7.07031 1.25781 6.76562 1.53906L2.80469 5.5L6.76562 9.48438C7.07031 9.76562 7.07031 10.2578 6.76562 10.5391C6.48438 10.8438 5.99219 10.8438 5.71094 10.5391L1.21094 6.03906C0.90625 5.75781 0.90625 5.26562 1.21094 4.98438Z"
        fill={color}
      />
    </Svg>
  );
};
