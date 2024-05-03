import React, { FunctionComponent } from "react";

import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";

export const ColorRightArrow: FunctionComponent<{
  width?: number;
  height?: number;
  color1?: string;
  color2?: string;
  color3?: string;
}> = ({
  width = 15,
  height = 14,
  color1 = "#5F38FB",
  color2 = "#CF447B",
  color3 = "#F9774B",
}) => {
  return (
    <Svg
      viewBox="0 0 15 14"
      fill="none"
      style={{
        width,
        height,
      }}
    >
      <Path
        d="M8.75 1.21875L14.25 6.46875C14.4062 6.625 14.5 6.8125 14.5 7.03125C14.5 7.21875 14.4062 7.40625 14.25 7.5625L8.75 12.8125C8.46875 13.0938 7.96875 13.0938 7.6875 12.7812C7.40625 12.5 7.40625 12 7.71875 11.7188L11.875 7.78125H1.25C0.8125 7.78125 0.5 7.4375 0.5 7.03125C0.5 6.59375 0.8125 6.28125 1.25 6.28125H11.875L7.71875 2.3125C7.40625 2.03125 7.40625 1.53125 7.6875 1.25C7.96875 0.9375 8.4375 0.9375 8.75 1.21875Z"
        fill="url(#paint0_linear_1504_14410)"
      />
      <Defs>
        <LinearGradient
          id="paint0_linear_1504_14410"
          x1="2.50064"
          y1="18.4289"
          x2="19.2709"
          y2="11.0982"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor={color1} />
          <Stop offset="0.640625" stopColor={color2} />
          <Stop offset="1" stopColor={color3} />
        </LinearGradient>
      </Defs>
    </Svg>
  );
};
