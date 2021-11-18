import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const VectorI: FunctionComponent<{
  height: number;
  color: string;
}> = ({ height, color }) => {
  return (
    <Svg
      fillRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit="2"
      clipRule="evenodd"
      viewBox="0 0 7 35"
      style={{
        height,
        aspectRatio: 7 / 35,
      }}
    >
      <Path
        fill={color}
        fillRule="nonzero"
        d="M387.369 133.386H393.66900000000004V168.036H387.369z"
        transform="translate(-387.369 -133.386)"
      />
    </Svg>
  );
};
