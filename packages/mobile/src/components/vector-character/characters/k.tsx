import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const VectorK: FunctionComponent<{
  height: number;
  color: string;
}> = ({ height, color }) => {
  return (
    <Svg
      fillRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit="2"
      clipRule="evenodd"
      viewBox="0 0 29 35"
      style={{
        height,
        aspectRatio: 29 / 35,
      }}
    >
      <Path
        fill={color}
        fillRule="nonzero"
        d="M448.319 168.036a63.273 63.273 0 00-3-4.2 66.829 66.829 0 00-7.45-8.15 36.2 36.2 0 00-3.95-3.2v15.55h-6.3v-34.65h6.3v14.3a259.295 259.295 0 007.025-7.325 265.431 265.431 0 003.375-3.725c1.067-1.2 2.034-2.283 2.9-3.25h7.55a273.13 273.13 0 01-3.5 3.95 272.78 272.78 0 01-3.8 4.125 462.936 462.936 0 01-3.925 4.125 168.757 168.757 0 01-3.875 3.9 46.373 46.373 0 014.275 3.725 74.954 74.954 0 014.275 4.55c1.4 1.617 2.742 3.3 4.025 5.05a77.355 77.355 0 013.525 5.225h-7.45z"
        transform="translate(-427.619 -133.386)"
      />
    </Svg>
  );
};
