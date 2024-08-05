import React, { FunctionComponent } from "react";
import { IconProps } from "./types";

export const MessageDelegateIcon: FunctionComponent<IconProps> = ({
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
      <g clipPath="url(#clip0_95_1631)">
        <path
          d="M15.0453 10.7197C15.637 10.3819 16.363 10.3819 16.9547 10.7197L20.7831 12.9054C21.3209 13.2124 21.3209 13.9878 20.7831 14.2949L16.9547 16.4806C16.363 16.8183 15.637 16.8183 15.0453 16.4806L11.2169 14.2949C10.6791 13.9878 10.6791 13.2124 11.2169 12.9054L15.0453 10.7197Z"
          stroke={color || "currentColor"}
        />
        <path
          d="M10.9664 16.7003L15.0454 19.0291C15.637 19.3668 16.3631 19.3668 16.9547 19.0291L17.6667 18.6226L19.3334 17.6667"
          stroke={color || "currentColor"}
          strokeLinecap="round"
        />
        <path
          d="M10.9663 19.2357L15.0453 21.5645C15.6369 21.9022 16.363 21.9022 16.9546 21.5645L17.6666 21.158"
          stroke={color || "currentColor"}
          strokeLinecap="round"
        />
        <path
          d="M21.4667 17.8C21.4667 17.5422 21.2578 17.3333 21 17.3333C20.7423 17.3333 20.5334 17.5422 20.5334 17.8V19.2H19.1334C18.8756 19.2 18.6667 19.4089 18.6667 19.6666C18.6667 19.9244 18.8756 20.1333 19.1334 20.1333H20.5334V21.5333C20.5334 21.791 20.7423 22 21 22C21.2578 22 21.4667 21.791 21.4667 21.5333V20.1333H22.8667C23.1244 20.1333 23.3334 19.9244 23.3334 19.6666C23.3334 19.4089 23.1244 19.2 22.8667 19.2H21.4667V17.8Z"
          fill={color || "currentColor"}
        />
      </g>
      <defs>
        <clipPath id="clip0_95_1631">
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
