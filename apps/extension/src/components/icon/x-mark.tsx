import React, { FunctionComponent } from "react";
import { IconProps } from "./types";

export const XMarkIcon: FunctionComponent<IconProps> = ({
  width = "1.5rem",
  height = "1.5rem",
  color,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        fill={color || "currentColor"}
        stroke="none"
        d="M7.536 6.264a.9.9 0 00-1.272 1.272L10.727 12l-4.463 4.464a.9.9 0 001.272 1.272L12 13.273l4.464 4.463a.9.9 0 101.272-1.272L13.273 12l4.463-4.464a.9.9 0 10-1.272-1.272L12 10.727 7.536 6.264z"
      />
    </svg>
  );
};
