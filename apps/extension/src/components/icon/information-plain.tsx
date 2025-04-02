import React, { FunctionComponent } from "react";
import { IconProps } from "./types";

export const InformationPlainIcon: FunctionComponent<IconProps> = ({
  width = "1.5rem",
  height = "1.5rem",
  color,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.3335 4.66683H8.66683V6.00016H7.3335V4.66683ZM7.3335 7.3335H8.66683V11.3335H7.3335V7.3335ZM8.00016 1.3335C4.32016 1.3335 1.3335 4.32016 1.3335 8.00016C1.3335 11.6802 4.32016 14.6668 8.00016 14.6668C11.6802 14.6668 14.6668 11.6802 14.6668 8.00016C14.6668 4.32016 11.6802 1.3335 8.00016 1.3335ZM8.00016 13.3335C5.06016 13.3335 2.66683 10.9402 2.66683 8.00016C2.66683 5.06016 5.06016 2.66683 8.00016 2.66683C10.9402 2.66683 13.3335 5.06016 13.3335 8.00016C13.3335 10.9402 10.9402 13.3335 8.00016 13.3335Z"
        fill={color || "currentColor"}
        stroke="none"
      />
    </svg>
  );
};
