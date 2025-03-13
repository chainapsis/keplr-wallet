import React from "react";

export const EnableChainsArrowUpIcon = ({
  width = "1rem",
  height = "1rem",
  color,
  strokeWidth = "2",
}: {
  width?: string;
  height?: string;
  color?: string;
  strokeWidth?: string;
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 25"
      fill="none"
    >
      <path
        d="M4.5 16.25L12 8.75L19.5 16.25"
        stroke={color || "currentColor"}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
