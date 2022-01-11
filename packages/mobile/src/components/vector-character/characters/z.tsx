import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const VectorZ: FunctionComponent<{
  height: number;
  color: string;
}> = ({ height, color }) => {
  return (
    <Svg
      fillRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit="2"
      clipRule="evenodd"
      viewBox="0 0 27 35"
      style={{
        height,
        aspectRatio: 27 / 35,
      }}
    >
      <Path
        fill={color}
        fillRule="nonzero"
        d="M971.319 138.036c-1.1 1.2-2.433 2.758-4 4.675a167.62 167.62 0 00-4.85 6.25 206.947 206.947 0 00-4.925 6.95 112.662 112.662 0 00-4.275 6.775h18.6v5.35h-26.2v-3.95a91.555 91.555 0 012.325-4.025c.884-1.45 1.825-2.942 2.825-4.475 1-1.533 2.042-3.083 3.125-4.65a193.26 193.26 0 013.225-4.525 229.037 229.037 0 013.125-4.15 77.476 77.476 0 012.875-3.525h-16.65v-5.35h24.8v4.65z"
        transform="translate(-945.669 -133.386)"
      />
    </Svg>
  );
};
