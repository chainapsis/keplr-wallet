import React, { FunctionComponent } from "react";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";

export const ArrowUpGradientIcon: FunctionComponent<{
  size?: number;
  color1?: string;
  color2?: string;
  color3?: string;
}> = ({
  size = 14,
  color1 = "#F9774B",
  color2 = "#CF447B",
  color3 = "#5F38FB",
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14">
      <Defs>
        <LinearGradient
          id="paint0_linear_868_3357"
          x1="13.9257"
          y1="7"
          x2="0.170629"
          y2="7"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0.226488" stopColor={color1} />
          <Stop offset="0.547025" stopColor={color2} />
          <Stop offset="0.856046" stopColor={color3} />
        </LinearGradient>
      </Defs>
      <Path
        d="M7.03125 0.25L12.2812 5.75C12.5625 6.0625 12.5625 6.53125 12.25 6.8125C11.9375 7.09375 11.4688 7.09375 11.1875 6.78125L7.25 2.625V13.25C7.25 13.6875 6.90625 14 6.5 14C6.0625 14 5.75 13.6875 5.75 13.25V2.625L1.78125 6.78125C1.5 7.09375 1.03125 7.09375 0.71875 6.8125C0.40625 6.53125 0.40625 6.03125 0.6875 5.75L5.9375 0.25C6.09375 0.09375 6.28125 0 6.5 0C6.6875 0 6.875 0.09375 7.03125 0.25Z"
        fill="url(#paint0_linear_868_3357)"
      />
    </Svg>
  );
};
