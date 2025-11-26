import React, { FunctionComponent } from "react";
import { IconProps } from "./types";

export const MenuTwoLineIcon: FunctionComponent<IconProps> = ({
  width = "1.5rem",
  height = "1.5rem",
  color,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.40002 8.10001C2.40002 7.60296 2.80297 7.20001 3.30002 7.20001H20.7C21.1971 7.20001 21.6 7.60296 21.6 8.10001C21.6 8.59707 21.1971 9.00001 20.7 9.00001H3.30002C2.80297 9.00001 2.40002 8.59707 2.40002 8.10001ZM2.40002 15.9C2.40002 15.403 2.80297 15 3.30002 15H20.7C21.1971 15 21.6 15.403 21.6 15.9C21.6 16.3971 21.1971 16.8 20.7 16.8H3.30002C2.80297 16.8 2.40002 16.3971 2.40002 15.9Z"
        fill={color || "currentColor"}
      />
    </svg>
  );
};
