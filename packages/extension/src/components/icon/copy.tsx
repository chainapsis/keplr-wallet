import React, { FunctionComponent } from "react";
import { IconProps } from "./types";

export const CopyIcon: FunctionComponent<IconProps> = ({
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
        d="M16 4H6.4C5.07452 4 4 5.07452 4 6.4V16"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <rect
        x="8.2"
        y="8.2"
        width="11.6"
        height="11.6"
        rx="1.2"
        stroke="currentColor"
        strokeWidth="2.4"
      />
    </svg>
  );
};
