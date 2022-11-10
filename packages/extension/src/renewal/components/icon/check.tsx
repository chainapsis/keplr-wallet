import React, { FunctionComponent } from "react";
import { IconProps } from "./types";

export const CheckIcon: FunctionComponent<IconProps> = ({
  width = 16,
  height = 16,
  color = "#2DCE89",
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width={width} height={height} rx="8" fill={color} />
      <path
        d="M4 7.18182L7.11111 11L12 5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
