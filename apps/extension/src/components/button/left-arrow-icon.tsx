import React, { FunctionComponent } from "react";
import { IconProps } from "../icon/types";

export const LeftArrowIcon: FunctionComponent<IconProps> = ({
  width = "1.5rem",
  height = "1.5rem",
  color,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M19.5 12L4.5 12M4.5 12L11.25 18.75M4.5 12L11.25 5.25"
        stroke={color || "#ABABB5"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
