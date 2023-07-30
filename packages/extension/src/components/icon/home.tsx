import React, { FunctionComponent } from "react";
import { IconProps } from "./types";

export const HomeIcon: FunctionComponent<IconProps> = ({
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
      viewBox="0 0 16 16"
    >
      <path
        stroke="none"
        fill={color || "currentColor"}
        fillRule="evenodd"
        d="M7.434 1.834a.8.8 0 011.132 0l5.6 5.6A.8.8 0 0113.6 8.8h-.8v4.8a.8.8 0 01-.8.8h-1.6a.8.8 0 01-.8-.8v-2.4a.8.8 0 00-.8-.8H7.2a.8.8 0 00-.8.8v2.4a.8.8 0 01-.8.8H4a.8.8 0 01-.8-.8V8.8h-.8a.8.8 0 01-.566-1.366l5.6-5.6z"
        clipRule="evenodd"
      />
    </svg>
  );
};
