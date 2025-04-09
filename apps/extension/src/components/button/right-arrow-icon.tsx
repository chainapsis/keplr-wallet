import React, { FunctionComponent } from "react";
import { IconProps } from "../icon/types";

export const RightArrowIcon: FunctionComponent<IconProps> = ({
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
        d="M3.6001 12.0002C3.6001 11.5031 4.00304 11.1002 4.5001 11.1002L17.2656 11.1002L12.2763 6.34894C11.918 6.00443 11.9068 5.43469 12.2513 5.0764C12.5959 4.7181 13.1656 4.70693 13.5239 5.05144L20.1239 11.3514C20.3004 11.5211 20.4001 11.7554 20.4001 12.0002C20.4001 12.245 20.3004 12.4793 20.1239 12.6489L13.5239 18.9489C13.1656 19.2935 12.5959 19.2823 12.2513 18.924C11.9068 18.5657 11.918 17.996 12.2763 17.6514L17.2656 12.9002L4.5001 12.9002C4.00304 12.9002 3.6001 12.4973 3.6001 12.0002Z"
        fill={color ?? "currentColor"}
        strokeWidth="0.1"
      />
    </svg>
  );
};
