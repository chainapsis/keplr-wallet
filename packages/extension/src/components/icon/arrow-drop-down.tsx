import React, { FunctionComponent } from "react";
import { IconProps } from "./types";

export const ArrowDropDownIcon: FunctionComponent<IconProps> = ({
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
        d="M12.9473 16.7822C12.4668 17.3998 11.5332 17.3998 11.0528 16.7822L5.10638 9.13674C4.49331 8.34851 5.05503 7.20001 6.0536 7.20001H17.9465C18.945 7.20001 19.5068 8.34851 18.8937 9.13674L12.9473 16.7822Z"
        fill={color || "currentColor"}
      />
    </svg>
  );
};
