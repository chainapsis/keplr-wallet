import React, { FunctionComponent } from "react";
import { IconProps } from "./types";

export const ShieldExclamationIcon: FunctionComponent<IconProps> = ({
  width = "1rem",
  height = "1rem",
  color,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        d="M8 6.00006V8.50006M8 1.80957C6.56634 3.16732 4.63042 4.00007 2.5 4.00007C2.46615 4.00007 2.43235 3.99986 2.3986 3.99944C2.13993 4.78618 2 5.6268 2 6.5001C2 10.2278 4.54955 13.36 8 14.2481C11.4505 13.36 14 10.2278 14 6.5001C14 5.6268 13.8601 4.78618 13.6014 3.99944C13.5677 3.99986 13.5339 4.00007 13.5 4.00007C11.3696 4.00007 9.43366 3.16732 8 1.80957ZM8 10.5001H8.005V10.5051H8V10.5001Z"
        stroke={color || "currentColor"}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
