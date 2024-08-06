import React, { FunctionComponent } from "react";
import { IconProps } from "./types";

export const MessageCancelUndelegateIcon: FunctionComponent<IconProps> = ({
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
      <g clipPath="url(#clip0_95_1795)">
        <path
          d="M14.25 14.25L17.75 17.75M17.75 14.25L14.25 17.75M23 16C23 19.866 19.866 23 16 23C12.134 23 9 19.866 9 16C9 12.134 12.134 9 16 9C19.866 9 23 12.134 23 16Z"
          stroke={color || "currentColor"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_95_1795">
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
