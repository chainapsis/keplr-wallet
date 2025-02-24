import React, { FunctionComponent } from "react";
import { IconProps } from "./types";

export const ArticleOutlineIcon: FunctionComponent<IconProps> = ({
  width = "1.5rem",
  height = "1.5rem",
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
      <mask
        id="mask0_15867_36763"
        style={{ maskType: "alpha" }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="16"
        height="16"
      >
        <rect width={width} height={height} fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask0_15867_36763)">
        <path
          d="M4.66667 11.3333H9.33333V10H4.66667V11.3333ZM4.66667 8.66667H11.3333V7.33333H4.66667V8.66667ZM4.66667 6H11.3333V4.66667H4.66667V6ZM3.33333 14C2.96667 14 2.65278 13.8694 2.39167 13.6083C2.13056 13.3472 2 13.0333 2 12.6667V3.33333C2 2.96667 2.13056 2.65278 2.39167 2.39167C2.65278 2.13056 2.96667 2 3.33333 2H12.6667C13.0333 2 13.3472 2.13056 13.6083 2.39167C13.8694 2.65278 14 2.96667 14 3.33333V12.6667C14 13.0333 13.8694 13.3472 13.6083 13.6083C13.3472 13.8694 13.0333 14 12.6667 14H3.33333ZM3.33333 12.6667H12.6667V3.33333H3.33333V12.6667Z"
          fill={color || "currentColor"}
        />
      </g>
    </svg>
  );
};
