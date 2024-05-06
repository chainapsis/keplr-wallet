import React, { FunctionComponent } from "react";
import { IconProps } from "./types";

export const CheckCircleIcon: FunctionComponent<IconProps> = ({
  width = "1.5rem",
  height = "1.5rem",
  color,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 20 20"
    >
      <path
        fill={color || "currentColor"}
        d="M8.833 13.833l5.875-5.875-1.166-1.166L8.833 11.5 6.458 9.125l-1.166 1.167 3.541 3.541zm1.167 4.5a8.11 8.11 0 01-3.25-.656 8.43 8.43 0 01-2.646-1.781 8.41 8.41 0 01-1.78-2.646A8.13 8.13 0 011.666 10a8.11 8.11 0 01.656-3.25 8.428 8.428 0 011.781-2.646 8.41 8.41 0 012.646-1.78A8.13 8.13 0 0110 1.666a8.11 8.11 0 013.25.656 8.429 8.429 0 012.646 1.781 8.421 8.421 0 011.781 2.646 8.1 8.1 0 01.656 3.25 8.11 8.11 0 01-.656 3.25 8.43 8.43 0 01-1.781 2.646 8.422 8.422 0 01-2.646 1.781 8.102 8.102 0 01-3.25.656z"
      />
    </svg>
  );
};
