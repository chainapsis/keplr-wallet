import React, { FunctionComponent } from "react";
import { IconProps } from "./types";

export const CheckToggleIcon: FunctionComponent<IconProps> = ({
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
        d="M9.00003 16.17L4.83003 12L3.41003 13.41L9.00003 19L21 6.99997L19.59 5.58997L9.00003 16.17Z"
        fill={color || "currentColor"}
      />
    </svg>
  );
};
