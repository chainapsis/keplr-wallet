import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const CopyIcon: FunctionComponent<{
  color: string;
  size: number;
}> = ({ color, size }) => {
  return (
    <Svg
      fillRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit="2"
      clipRule="evenodd"
      viewBox="0 0 10 10"
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
      }}
    >
      <Path
        fill={color}
        fillRule="nonzero"
        d="M1.5 0a1 1 0 00-1 1v7h1V1h7V0h-7zm2 2a1 1 0 00-1 1v6a1 1 0 001 1h6a1 1 0 001-1V3a1 1 0 00-1-1h-6zm0 1h6v6h-6V3z"
        transform="translate(-.5)"
      />
    </Svg>
  );
};
