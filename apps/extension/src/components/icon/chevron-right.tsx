import React, { FunctionComponent } from "react";
import { IconProps } from "./types";

export const ChevronRightIcon: FunctionComponent<IconProps> = ({
  width = "1rem",
  height = "1rem",
  color,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill={color || "currentColor"}
    >
      <path
        d="M5.66669 12.6666L10.3334 7.99992L5.66669 3.33325"
        stroke="currentColor"
        strokeWidth="1.2963"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};
