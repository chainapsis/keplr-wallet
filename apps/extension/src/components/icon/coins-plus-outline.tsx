import React, { FunctionComponent } from "react";
import { IconProps } from "./types";

export const CoinsPlusOutlineIcon: FunctionComponent<IconProps> = ({
  width = "24",
  height = "25",
  color,
}) => {
  return (
    <svg width={width} height={height} viewBox="0 0 24 25" fill="none">
      <circle
        cx="14.7304"
        cy="12.5"
        r="6.99997"
        stroke={color || "currentColor"}
        strokeWidth="1.5"
      />
      <path
        d="M6.80341 6.33398C4.22106 7.3793 2.39941 9.911 2.39941 12.8682C2.39941 15.8254 4.22106 18.3571 6.80341 19.4024"
        stroke={color || "currentColor"}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M14.5652 10.0215V14.978M14.5652 14.978L12.5 12.9128M14.5652 14.978L16.6305 12.9128"
        stroke={color || "currentColor"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
