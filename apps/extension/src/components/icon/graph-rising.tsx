import React, { FunctionComponent } from "react";
import { IconProps } from "./types";

export const GraphRisingIcon: FunctionComponent<IconProps> = ({
  width = "0.875rem",
  height = "0.6875rem",
  color,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 14 11"
      fill="none"
    >
      <path
        d="M1.75 10L4.89566 3.21429L9.13034 8.42857L12.75 1"
        stroke={color || "currentColor"}
        strokeWidth="1.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
