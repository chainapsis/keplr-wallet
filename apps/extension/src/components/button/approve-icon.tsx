import React, { FunctionComponent } from "react";
import { IconProps } from "../icon/types";

export const ApproveIcon: FunctionComponent<IconProps> = ({
  width = "1.5rem",
  height = "1.5rem",
  color,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      strokeWidth="0.1"
      fill="none"
    >
      <path
        d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"
        fill={color || "currentColor"}
      />
    </svg>
  );
};
