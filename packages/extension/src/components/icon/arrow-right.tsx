import React, { FunctionComponent } from "react";
import { IconProps } from "./types";

export const ArrowRightIcon: FunctionComponent<IconProps> = ({
  width = 24,
  height = 24,
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
        d="M8.5 4.5L14.5 12L8.5 19.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
