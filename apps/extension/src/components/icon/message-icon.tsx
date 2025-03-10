import React, { FunctionComponent } from "react";
import { IconProps } from "./types";

export const MessageIcon: FunctionComponent<IconProps> = ({
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
      <g clipPath="url(#clip0_14730_33071)">
        <path
          d="M14.5 4.5V11.5C14.5 12.3284 13.8284 13 13 13H3C2.17157 13 1.5 12.3284 1.5 11.5V4.5M14.5 4.5C14.5 3.67157 13.8284 3 13 3H3C2.17157 3 1.5 3.67157 1.5 4.5M14.5 4.5V4.66181C14.5 5.1827 14.2298 5.6663 13.7861 5.93929L8.78615 9.01622C8.30404 9.3129 7.69596 9.3129 7.21385 9.01622L2.21385 5.93929C1.77023 5.6663 1.5 5.1827 1.5 4.66181V4.5"
          stroke={color || "currentColor"}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_14730_33071">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};
