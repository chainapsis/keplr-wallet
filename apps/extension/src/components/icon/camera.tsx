import React, { FunctionComponent } from "react";
import { IconProps } from "./types";

export const CameraIcon: FunctionComponent<IconProps> = ({
  width = "1.5rem",
  height = "1.5rem",
  color,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M27.9117 5.73509C27.3672 4.10172 25.8387 3 24.117 3H15.883C14.1613 3 12.6328 4.10172 12.0883 5.73509L11.2279 8.31623C11.0918 8.72457 10.7097 9 10.2792 9H6C3.23858 9 1 11.2386 1 14V32C1 34.7614 3.23858 37 6 37H34C36.7614 37 39 34.7614 39 32V14C39 11.2386 36.7614 9 34 9H29.7208C29.2903 9 28.9082 8.72457 28.7721 8.31623L27.9117 5.73509ZM20 30C23.866 30 27 26.866 27 23C27 19.134 23.866 16 20 16C16.134 16 13 19.134 13 23C13 26.866 16.134 30 20 30ZM20 32C24.9706 32 29 27.9706 29 23C29 18.0294 24.9706 14 20 14C15.0294 14 11 18.0294 11 23C11 27.9706 15.0294 32 20 32ZM30 12C29.4477 12 29 12.4477 29 13C29 13.5523 29.4477 14 30 14H33C33.5523 14 34 13.5523 34 13C34 12.4477 33.5523 12 33 12H30Z"
        fill={color || "currentColor"}
      />
    </svg>
  );
};
