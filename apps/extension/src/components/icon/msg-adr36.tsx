import React, { FunctionComponent } from "react";
import { IconProps } from "./types";

export const MessageAdr36Icon: FunctionComponent<IconProps> = ({
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
      <path
        d="M10.741 21.259L14.7985 17.2015M16.573 12.3835L19.6165 15.427L18.094 19.4845L10.975 22L10 21.0258L12.5163 13.9052L16.5738 12.3835H16.573ZM20.0425 15.8523L16.1477 11.9575L18.1053 10L22 13.8955L20.0425 15.8523Z"
        stroke={color || "currentColor"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
