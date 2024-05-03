import React, { FunctionComponent } from "react";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";

export const EarnIcon: FunctionComponent<{
  size?: number;
  color1?: string;
  color2?: string;
  color3?: string;
}> = ({
  size = 16,
  color1 = "#F9774B",
  color2 = "#CF447B",
  color3 = "#5F38FB",
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <Defs>
        <LinearGradient
          id="paint0_linear_868_3360"
          x1="17.9009"
          y1="8"
          x2="-0.439161"
          y2="8"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0.226488" stopColor={color1} />
          <Stop offset="0.547025" stopColor={color2} />
          <Stop offset="0.856046" stopColor={color3} />
        </LinearGradient>
      </Defs>
      <Path
        d="M9.59375 6.46875C12.1875 6.1875 14.2188 4.125 14.4688 1.5H14.25C11.8438 1.5 9.8125 3.0625 9.03125 5.1875C8.78125 4.65625 8.4375 4.15625 8.0625 3.71875C9.25 1.5 11.5625 0 14.25 0H15C15.5312 0 16 0.46875 16 1C16 4.5625 13.3438 7.5 9.90625 7.9375C9.84375 7.4375 9.75 6.96875 9.59375 6.46875ZM1.5 3.5V4C1.5 7.0625 3.9375 9.5 7 9.5H7.25V9C7.25 5.96875 4.78125 3.5 1.75 3.5H1.5ZM8.75 9V9.5V11V15.25C8.75 15.6875 8.40625 16 8 16C7.5625 16 7.25 15.6875 7.25 15.25V11H7C3.125 11 0 7.875 0 4V3C0 2.46875 0.4375 2 1 2H1.75C5.59375 2 8.75 5.15625 8.75 9Z"
        fill="url(#paint0_linear_868_3360)"
      />
    </Svg>
  );
};
