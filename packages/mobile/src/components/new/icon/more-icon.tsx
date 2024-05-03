import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const MoreIcon: FunctionComponent<{
  size?: number;
  color?: string;
}> = ({ size = 16, color = "white" }) => {
  return (
    <Svg
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
      }}
      viewBox="0 0 15 12"
      fill="none"
    >
      <Path
        d="M0.299988 0.75C0.299988 0.34375 0.612488 0 1.04999 0H13.55C13.9562 0 14.3 0.34375 14.3 0.75C14.3 1.1875 13.9562 1.5 13.55 1.5H1.04999C0.612488 1.5 0.299988 1.1875 0.299988 0.75ZM0.299988 5.75C0.299988 5.34375 0.612488 5 1.04999 5H13.55C13.9562 5 14.3 5.34375 14.3 5.75C14.3 6.1875 13.9562 6.5 13.55 6.5H1.04999C0.612488 6.5 0.299988 6.1875 0.299988 5.75ZM14.3 10.75C14.3 11.1875 13.9562 11.5 13.55 11.5H1.04999C0.612488 11.5 0.299988 11.1875 0.299988 10.75C0.299988 10.3438 0.612488 10 1.04999 10H13.55C13.9562 10 14.3 10.3438 14.3 10.75Z"
        fill={color}
      />
    </Svg>
  );
};
