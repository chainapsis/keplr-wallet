import React, { FunctionComponent } from "react";
import { IconProps } from "./types";

export const StarIcon: FunctionComponent<IconProps> = ({
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
        d="M10.7881 3.21068C11.2364 2.13274 12.7635 2.13273 13.2118 3.21068L15.2938 8.2164L20.6979 8.64964C21.8616 8.74293 22.3335 10.1952 21.4469 10.9547L17.3295 14.4817L18.5874 19.7551C18.8583 20.8908 17.6229 21.7883 16.6266 21.1798L11.9999 18.3538L7.37329 21.1798C6.37697 21.7883 5.14158 20.8908 5.41246 19.7551L6.67038 14.4817L2.55303 10.9547C1.66639 10.1952 2.13826 8.74293 3.302 8.64964L8.70609 8.2164L10.7881 3.21068Z"
        fill={color || "currentColor"}
      />
    </svg>
  );
};
