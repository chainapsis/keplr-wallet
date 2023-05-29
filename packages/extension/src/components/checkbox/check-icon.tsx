import React, { FunctionComponent } from "react";
import { IconProps } from "../icon/types";

export const CheckIcon: FunctionComponent<IconProps> = ({
  width = "1.0625rem",
  height = "1.0625rem",
  color,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.92491 10.8351L4.14491 8.05507L3.19824 8.99507L6.92491 12.7217L14.9249 4.72174L13.9849 3.78174L6.92491 10.8351Z"
        fill={color || "currentColor"}
      />
    </svg>
  );
};
