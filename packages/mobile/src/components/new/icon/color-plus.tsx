import React, { FunctionComponent } from "react";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";

export const ColorPlusIcon: FunctionComponent<{
  size?: number;
  color1?: string;
  color2?: string;
  color3?: string;
}> = ({
  size = 15,
  color1 = "#F9774B",
  color2 = "#CF447B",
  color3 = "#5F38FB",
}) => {
  return (
    <Svg
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
      }}
      viewBox="0 0 14 15"
      fill="none"
    >
      <Path
        d="M8 1.5V6H12.5C13.0312 6 13.5 6.46875 13.5 7C13.5 7.5625 13.0312 8 12.5 8H8V12.5C8 13.0625 7.53125 13.5 7 13.5C6.4375 13.5 6 13.0625 6 12.5V8H1.5C0.9375 8 0.5 7.5625 0.5 7C0.5 6.46875 0.9375 6 1.5 6H6V1.5C6 0.96875 6.4375 0.5 7 0.5C7.53125 0.5 8 0.96875 8 1.5Z"
        fill="url(#paint0_linear_517_8517)"
      />
      <Defs>
        <LinearGradient
          id="paint0_linear_517_8517"
          x1="15.6633"
          y1="7"
          x2="-0.384266"
          y2="7"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0.226488" stopColor={color1} />
          <Stop offset="0.547025" stopColor={color2} />
          <Stop offset="0.856046" stopColor={color3} />
        </LinearGradient>
      </Defs>
    </Svg>
  );
};
