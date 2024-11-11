import React, { FunctionComponent } from "react";
import { IconProps } from "./types";

export const CheckIcon: FunctionComponent<IconProps> = ({
  width = "1.5rem",
  height = "1.5rem",
  color,
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
        d="M4.5 12.75L10.5 18.75L19.5 5.25"
        stroke={color || "currentColor"}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};
