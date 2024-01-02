import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const VectorY: FunctionComponent<{
  height: number;
  color: string;
}> = ({ height, color }) => {
  return (
    <Svg
      fillRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit="2"
      clipRule="evenodd"
      viewBox="0 0 31 35"
      style={{
        height,
        aspectRatio: 31 / 35,
      }}
    >
      <Path
        fill={color}
        fillRule="nonzero"
        d="M928.269 148.736a280.8 280.8 0 004.4-7.6 98.735 98.735 0 003.9-7.75h7a308.582 308.582 0 01-5.825 10.525 235.996 235.996 0 01-6.475 10.525v13.6h-6.3v-13.5c-2.3-3.567-4.466-7.1-6.5-10.6a300.988 300.988 0 01-5.85-10.55h7.4c1.167 2.6 2.45 5.183 3.85 7.75s2.867 5.1 4.4 7.6z"
        transform="translate(-912.619 -133.386)"
      />
    </Svg>
  );
};
