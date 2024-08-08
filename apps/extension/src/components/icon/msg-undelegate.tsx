import React, { FunctionComponent } from "react";
import { IconProps } from "./types";

export const MessageUndelegateIcon: FunctionComponent<IconProps> = ({
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
      <g clipPath="url(#clip0_95_1640)">
        <path
          d="M15.0453 10.7197C15.637 10.3819 16.363 10.3819 16.9547 10.7197L20.7831 12.9054C21.3209 13.2124 21.3209 13.9878 20.7831 14.2949L16.9547 16.4806C16.363 16.8183 15.637 16.8183 15.0453 16.4806L11.2169 14.2949C10.6791 13.9878 10.6791 13.2124 11.2169 12.9054L15.0453 10.7197Z"
          stroke={color || "currentColor"}
        />
        <path
          d="M21.0337 16.7003L16.9547 19.0291C16.3631 19.3668 15.637 19.3668 15.0454 19.0291L10.9664 16.7003"
          stroke={color || "currentColor"}
          strokeLinecap="round"
        />
        <path
          d="M10.9663 19.2357L15.0453 21.5644C15.6369 21.9022 16.363 21.9022 16.9546 21.5644L17.532 21.2347"
          stroke={color || "currentColor"}
          strokeLinecap="round"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M22.8666 19.902C22.8666 20.1782 22.6457 20.402 22.3732 20.402L19.3333 20.402C19.0608 20.402 18.84 20.1782 18.84 19.902C18.84 19.6259 19.0608 19.402 19.3333 19.402L22.3732 19.402C22.6457 19.402 22.8666 19.6259 22.8666 19.902Z"
          fill={color || "currentColor"}
        />
      </g>
      <defs>
        <clipPath id="clip0_95_1640">
          <rect
            width="16"
            height="16"
            fill="white"
            transform="translate(8 8)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};
