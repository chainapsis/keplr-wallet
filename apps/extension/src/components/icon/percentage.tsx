import React, { FunctionComponent } from "react";
import { IconProps } from "./types";

export const PercentageIcon: FunctionComponent<IconProps> = ({
  width = "1.5rem",
  height = "1.5rem",
  color,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="Frame 1000010815">
        <circle
          id="Ellipse 776"
          cx="3.14286"
          cy="3.14286"
          r="2.14286"
          stroke={color || "currentColor"}
          strokeWidth="1.28571"
        />
        <circle
          id="Ellipse 777"
          cx="10.8557"
          cy="10.8572"
          r="2.14286"
          stroke={color || "currentColor"}
          strokeWidth="1.28571"
        />
        <path
          id="Vector 660"
          d="M1.85742 11.9421L12.3708 1.42871"
          stroke={color || "currentColor"}
          strokeWidth="1.28571"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
};
