import React, { FunctionComponent } from "react";
import { IconProps } from "./types";

export const InformationPlainIcon: FunctionComponent<IconProps> = ({
  width = "1.5rem",
  height = "1.5rem",
  color,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9 18C13.9617 18 18 13.9617 18 9C18 4.03832 13.9617 1.90735e-06 9 1.90735e-06C4.03832 1.90735e-06 0 4.03832 0 9C0 13.9617 4.03832 18 9 18ZM9 16.5C4.84898 16.5 1.5 13.151 1.5 9C1.5 4.84898 4.84898 1.5 9 1.5C13.151 1.5 16.5 4.84898 16.5 9C16.5 13.151 13.151 16.5 9 16.5ZM8.99707 6.14209C9.61882 6.14209 9.99023 5.81039 9.99023 5.24414C9.99023 4.68839 9.61807 4.35791 8.99707 4.35791C8.38057 4.35791 8.01123 4.68839 8.01123 5.24414C8.01123 5.81039 8.38057 6.14209 8.99707 6.14209Z"
        fill={color || "currentColor"}
        stroke="none"
      />
      <path
        d="M9.75883 7.5L9.90971 13.5H8.09038L8.24126 7.5H9.75883Z"
        fill={color || "currentColor"}
        stroke="none"
      />
    </svg>
  );
};
