import React, { FunctionComponent } from "react";
import { IconProps } from "./types";

export const MessageSendIcon: FunctionComponent<IconProps> = ({
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
      <path
        d="M11.4167 20.5834L20.5834 11.4167M20.5834 11.4167L13.7084 11.4167M20.5834 11.4167V18.2917"
        stroke={color || "currentColor"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
