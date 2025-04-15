import React, { FunctionComponent } from "react";
import { IconProps } from "./types";

export const MessageRegisterIcon: FunctionComponent<IconProps> = ({
  width = "2rem",
  height = "2rem",
  color,
}) => {
  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        width="12"
        height="14"
        viewBox="0 0 12 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="0.666504"
          y="0.867188"
          width="10.2222"
          height="12.2667"
          rx="1.36296"
          stroke={color || "#ABABB5"}
        />
        <path
          d="M3.12012 4.54688L8.02678 4.54688"
          stroke={color || "#ABABB5"}
          strokeLinecap="round"
        />
        <path
          d="M3.12012 7L6.80012 7"
          stroke={color || "#ABABB5"}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};
