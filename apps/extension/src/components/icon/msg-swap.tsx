import React, { FunctionComponent } from "react";
import { IconProps } from "./types";

export const MessageSwapIcon: FunctionComponent<IconProps> = ({
  width = "2rem",
  height = "2rem",
  color,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13 22.0001L10 19.0001M10 19.0001L13 16.0001M10 19.0001H19M19 10.0001L22 13.0001M22 13.0001L19 16.0001M22 13.0001L13 13.0001"
        stroke={color || "currentColor"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
