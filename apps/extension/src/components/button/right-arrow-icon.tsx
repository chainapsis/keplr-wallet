import React, { FunctionComponent } from "react";
import { IconProps } from "../icon/types";

export const RightArrowIcon: FunctionComponent<IconProps> = ({
  width = "1.5rem",
  height = "1.5rem",
  color,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.1001 12.0002C4.1001 11.5031 4.50304 11.1002 5.0001 11.1002L17.7656 11.1002L12.7763 6.34894C12.418 6.00443 12.4068 5.43469 12.7513 5.0764C13.0959 4.7181 13.6656 4.70693 14.0239 5.05144L20.6239 11.3514C20.8004 11.5211 20.9001 11.7554 20.9001 12.0002C20.9001 12.245 20.8004 12.4793 20.6239 12.6489L14.0239 18.9489C13.6656 19.2935 13.0959 19.2823 12.7513 18.924C12.4068 18.5657 12.418 17.996 12.7763 17.6514L17.7656 12.9002L5.0001 12.9002C4.50304 12.9002 4.1001 12.4973 4.1001 12.0002Z"
        fill={color || "#F6F6F9"}
      />
    </svg>
  );
};
