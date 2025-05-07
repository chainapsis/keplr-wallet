import React, { FunctionComponent } from "react";
import { IconProps } from "./types";

export const MsgApproveIcon: FunctionComponent<IconProps> = ({
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
        d="M9 16.17L4.83 12L3.41 13.41L9 19L21 6.99997L19.59 5.58997L9 16.17Z"
        fill={color || "currentColor"}
      />
    </svg>
  );
};
