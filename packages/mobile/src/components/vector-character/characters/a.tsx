import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const VectorA: FunctionComponent<{
  height: number;
  color: string;
}> = ({ height, color }) => {
  return (
    <Svg
      fillRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit="2"
      clipRule="evenodd"
      viewBox="0 0 34 35"
      style={{
        height,
        aspectRatio: 34 / 35,
      }}
    >
      <Path
        fill={color}
        fillRule="nonzero"
        d="M149.219 168.036c-.466-1.367-.95-2.717-1.45-4.05-.5-1.333-.983-2.7-1.45-4.1h-14.6c-.466 1.4-.941 2.775-1.425 4.125-.483 1.35-.958 2.692-1.425 4.025h-6.55c1.3-3.7 2.534-7.117 3.7-10.25 1.167-3.133 2.309-6.1 3.425-8.9 1.117-2.8 2.225-5.467 3.325-8 1.1-2.533 2.234-5.033 3.4-7.5h5.95c1.167 2.467 2.3 4.967 3.4 7.5 1.1 2.533 2.209 5.2 3.325 8 1.117 2.8 2.267 5.767 3.45 8.9a467.697 467.697 0 013.725 10.25h-6.8zm-10.2-27.95a184.827 184.827 0 00-2.625 6.45 354.136 354.136 0 00-3.075 8.25h11.4a334.563 334.563 0 00-3.1-8.3c-1-2.567-1.866-4.7-2.6-6.4z"
        transform="translate(-122.319 -133.386)"
      />
    </Svg>
  );
};
