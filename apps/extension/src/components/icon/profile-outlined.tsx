import React, { FunctionComponent } from "react";
import { IconProps } from "./types";

export const ProfileOutlinedIcon: FunctionComponent<IconProps> = ({
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
      fill="none"
    >
      <path
        d="M10.5 4C10.5 5.38071 9.38072 6.5 8.00001 6.5C6.61929 6.5 5.50001 5.38071 5.50001 4C5.50001 2.61929 6.61929 1.5 8.00001 1.5C9.38072 1.5 10.5 2.61929 10.5 4Z"
        stroke={color || "currentColor"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.00076 13.4122C3.04763 10.6913 5.26792 8.5 8.00001 8.5C10.7322 8.5 12.9525 10.6914 12.9993 13.4124C11.4774 14.1107 9.78427 14.5 8.00022 14.5C6.216 14.5 4.52274 14.1106 3.00076 13.4122Z"
        stroke={color || "currentColor"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
