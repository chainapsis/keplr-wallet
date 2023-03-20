import React, { FunctionComponent } from "react";
import { IconProps } from "./types";
import { ColorPalette } from "../../styles";

export const ArrowDownIcon: FunctionComponent<IconProps> = ({
  width = 24,
  height = 24,
  color = ColorPalette["gray-300"],
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M19 9L11.5 15L4 9"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
