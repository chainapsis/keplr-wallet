import React, { FunctionComponent } from "react";
import Svg, { ClipPath, Defs, G, Path } from "react-native-svg";

export const CloseIcon: FunctionComponent<{
  size: number;
  color: string;
}> = ({ size, color }) => {
  return (
    <Svg
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
      }}
      fill="none"
      viewBox="0 0 28 28"
    >
      <G clipPath="url(#clip0)">
        <Path
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
          d="M21 7L7 21m14 0L7 7"
        />
      </G>
      <Defs>
        <ClipPath id="clip0">
          <Path fill="#fff" d="M0 0H28V28H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};
