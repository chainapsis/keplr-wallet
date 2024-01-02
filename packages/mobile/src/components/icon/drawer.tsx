import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const OpenDrawerIcon: FunctionComponent<{
  color: string;
  size: number;
}> = ({ color, size }) => {
  return (
    <Svg width={size} height={size} fill="none" viewBox="0 0 28 28">
      <Path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12.833 5.833l7.875 7.875-7.875 7.875"
      />
      <Path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M5.833 5.833l7.875 7.875-7.875 7.875"
      />
    </Svg>
  );
};
