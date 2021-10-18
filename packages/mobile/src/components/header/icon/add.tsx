import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";
import { useStyle } from "../../../styles";

export const HeaderAddIcon: FunctionComponent<{
  color?: string;
  size?: number;
}> = ({ color, size = 28 }) => {
  const style = useStyle();

  if (!color) {
    color = style.get("color-text-black-high").color;
  }

  return (
    <Svg width={size} height={size} fill="none" viewBox="0 0 28 28">
      <Path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M23.333 14H4.667M14 4.667v18.667V4.667z"
      />
    </Svg>
  );
};
