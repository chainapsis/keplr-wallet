import React, { FunctionComponent } from "react";

export const PinIcon: FunctionComponent<{
  size?: number | string;
  color?: string;
}> = ({ size = 20, color }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13.3333 9.15L15 10.85V12.55H10.8333V17.65L10 18.5L9.16667 17.65V12.55H5V10.85L6.66667 9.15V3.2H5.83333V1.5H14.1667V3.2H13.3333V9.15Z"
        fill={color || "currentColor"}
      />
    </svg>
  );
};
