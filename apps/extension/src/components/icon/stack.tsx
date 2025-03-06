import React, { FunctionComponent } from "react";
import { IconProps } from "./types";

export const StackIcon: FunctionComponent<IconProps> = ({
  width = "1rem",
  height = "1rem",
  color,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="heroicons-outline/circle-stack">
        <path
          id="Vector"
          d="M60.75 19.125C60.75 25.9595 49.669 31.5 36 31.5C22.331 31.5 11.25 25.9595 11.25 19.125M60.75 19.125C60.75 12.2905 49.669 6.75 36 6.75C22.331 6.75 11.25 12.2905 11.25 19.125M60.75 19.125V52.875C60.75 59.7095 49.669 65.25 36 65.25C22.331 65.25 11.25 59.7095 11.25 52.875V19.125M60.75 19.125V30.375M11.25 19.125V30.375M60.75 30.375V41.625C60.75 48.4595 49.669 54 36 54C22.331 54 11.25 48.4595 11.25 41.625V30.375M60.75 30.375C60.75 37.2095 49.669 42.75 36 42.75C22.331 42.75 11.25 37.2095 11.25 30.375"
          stroke={color || "currentColor"}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
};
