import React, { FunctionComponent } from "react";
import { IconProps } from "./types";

export const MessageExecuteContractIcon: FunctionComponent<IconProps> = ({
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
      <rect
        x="10.6666"
        y="9.86664"
        width="10.2222"
        height="12.2667"
        rx="1.36296"
        stroke={color || "currentColor"}
      />
      <path
        d="M13.12 13.5467L18.0266 13.5467"
        stroke={color || "currentColor"}
        strokeLinecap="round"
      />
      <path
        d="M13.12 16L16.8 16"
        stroke={color || "currentColor"}
        strokeLinecap="round"
      />
    </svg>
  );
};
