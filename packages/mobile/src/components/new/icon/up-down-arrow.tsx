import React, { FunctionComponent } from "react";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";

export const UpDownArrowIcon: FunctionComponent<{
  size?: number;
  color1?: string;
  color2?: string;
  color3?: string;
}> = ({
  size = 17,
  color1 = "#F9774B",
  color2 = "#CF447B",
  color3 = "#5F38FB",
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 17 16">
      <Defs>
        <LinearGradient
          id="paint0_linear_856_4970"
          x1="19.6385"
          y1="8"
          x2="-0.994056"
          y2="8"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0.226488" stopColor={color1} />
          <Stop offset="0.547025" stopColor={color2} />
          <Stop offset="0.856046" stopColor={color3} />
        </LinearGradient>
      </Defs>
      <Path
        d="M16.0312 11.7812L13.0312 14.7812C12.7188 15.0938 12.25 15.0938 11.9688 14.7812L8.96875 11.7812C8.65625 11.5 8.65625 11.0312 8.96875 10.75C9.25 10.4375 9.71875 10.4375 10.0312 10.75L11.75 12.4688V1.75C11.75 1.34375 12.0625 1 12.5 1C12.9062 1 13.25 1.34375 13.25 1.75V12.4688L14.9688 10.75C15.25 10.4375 15.7188 10.4375 16.0312 10.75C16.3125 11.0312 16.3125 11.5 16.0312 11.7812ZM5.03125 1.21875L8 4.21875C8.3125 4.53125 8.3125 5 8 5.28125C7.71875 5.59375 7.25 5.59375 6.9375 5.28125L5.21875 3.5625V14.25C5.21875 14.6875 4.90625 15 4.46875 15C4.0625 15 3.71875 14.6875 3.71875 14.25V3.5625L2 5.28125C1.71875 5.59375 1.25 5.59375 0.96875 5.28125C0.65625 5 0.65625 4.53125 0.96875 4.21875L3.96875 1.21875C4.25 0.9375 4.71875 0.9375 5.03125 1.21875Z"
        fill="url(#paint0_linear_856_4970)"
      />
    </Svg>
  );
};
