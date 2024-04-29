import React, { FunctionComponent } from "react";
import { IconProps } from "./types";

export const KeystoneIcon: FunctionComponent<IconProps> = ({
  width = "auto",
  height = "1.5rem",
  color,
}) => {
  const colors: { [key: string]: { color1: string; color2: string } } = {
    dark: {
      color1: "#f5f8ff",
      color2: "#3d71ff",
    },
    light: {
      color1: "#000",
      color2: "#1f5aff",
    },
  };
  const color1 = color && color in colors ? colors[color].color1 : color;
  const color2 = color && color in colors ? colors[color].color2 : color;
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 640 640"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="m120 100h240l-160 340h-120z" fill={color1 || "currentColor"} />
      <path d="m520 540h-240l160-340h120z" fill={color2 || "currentColor"} />
    </svg>
  );
};
