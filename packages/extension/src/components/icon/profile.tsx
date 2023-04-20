import React, { FunctionComponent } from "react";
import { IconProps } from "./types";

export const ProfileIcon: FunctionComponent<IconProps> = ({
  width = 24,
  height = 24,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 28 28"
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M10.25 9a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM7.126 20.754a6.875 6.875 0 0113.748 0 .625.625 0 01-.364.58A15.57 15.57 0 0114 22.75a15.57 15.57 0 01-6.51-1.417.625.625 0 01-.364-.579z"
        clipRule="evenodd"
      />
    </svg>
  );
};
