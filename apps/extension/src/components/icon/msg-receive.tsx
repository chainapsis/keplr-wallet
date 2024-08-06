import React, { FunctionComponent } from "react";
import { IconProps } from "./types";

export const MessageReceiveIcon: FunctionComponent<IconProps> = ({
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
        d="M20.5833 11.4167L11.4166 20.5834M11.4166 20.5834L18.2916 20.5834M11.4166 20.5834L11.4166 13.7084"
        stroke={color || "currentColor"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
