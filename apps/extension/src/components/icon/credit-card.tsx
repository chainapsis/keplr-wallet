import React, { FunctionComponent } from "react";
import { IconProps } from "./types";

export const CreditCardIcon: FunctionComponent<IconProps> = ({
  width = "1.5rem",
  height = "1.5rem",
  color,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 21 17"
      fill="none"
    >
      <path
        d="M0.75 4.5H20.25M0.75 5.25H20.25M3.75 10.5H9.75M3.75 12.75H6.75M3 15.75H18C19.2426 15.75 20.25 14.7426 20.25 13.5V3C20.25 1.75736 19.2426 0.75 18 0.75H3C1.75736 0.75 0.75 1.75736 0.75 3V13.5C0.75 14.7426 1.75736 15.75 3 15.75Z"
        stroke={color || "currentColor"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
