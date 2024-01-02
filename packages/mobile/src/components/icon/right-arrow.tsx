import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const RightArrowWithBarIcon: FunctionComponent<{
  color: string;
  size: number;
}> = ({ color, size }) => {
  return (
    <Svg
      viewBox="0 0 15 13"
      height={size}
      width={size}
      style={{
        height: size,
        width: size,
      }}
    >
      <Path
        d="M14.25 6.81738L8.75 12.0674C8.4375 12.3486 7.96875 12.3486 7.6875 12.0361C7.40625 11.7236 7.40625 11.2549 7.71875 10.9736L11.875 7.00488H1.25C0.8125 7.00488 0.5 6.69238 0.5 6.25488C0.5 5.84863 0.8125 5.50488 1.25 5.50488H11.875L7.71875 1.56738C7.40625 1.28613 7.40625 0.786133 7.6875 0.504883C7.96875 0.192383 8.46875 0.192383 8.75 0.473633L14.25 5.72363C14.4062 5.87988 14.5 6.06738 14.5 6.25488C14.5 6.47363 14.4062 6.66113 14.25 6.81738Z"
        fill={color}
      />
    </Svg>
  );
};
