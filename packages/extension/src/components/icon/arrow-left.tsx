import React, { FunctionComponent } from "react";
import { IconProps } from "./types";
import { ColorPalette } from "../../styles";

export const ArrowLeftIcon: FunctionComponent<IconProps> = ({
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
        d="M15.5293 20L7.99989 12L15.5293 4"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
