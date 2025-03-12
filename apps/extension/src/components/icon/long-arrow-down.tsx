import React, { FunctionComponent } from "react";
import { IconProps } from "./types";

export const LongArrowDownIcon: FunctionComponent<IconProps> = ({
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
      <g id="icon/outlined/arrow">
        <path
          id="Icon"
          d="M12 4L12 20M12 20L20 12M12 20L4 12"
          stroke={color || "currentColor"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
};
