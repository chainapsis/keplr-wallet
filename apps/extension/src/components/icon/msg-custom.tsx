import React, { FunctionComponent } from "react";
import { IconProps } from "./types";

export const MessageCustomIcon: FunctionComponent<IconProps> = ({
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
      <circle
        cx="16"
        cy="15.3927"
        r="5.1686"
        stroke={color || "currentColor"}
        strokeWidth="1.2"
      />
      <path
        d="M11.1063 16.1655C9.43945 17.6381 8.55682 18.9655 8.95573 19.6247C9.58914 20.6713 13.2137 19.637 17.0513 17.3145C20.889 14.992 23.4865 12.2608 22.8531 11.2142C22.4732 10.5865 21.0175 10.7073 19.0851 11.4055"
        stroke={color || "currentColor"}
        strokeWidth="1.2"
      />
    </svg>
  );
};
