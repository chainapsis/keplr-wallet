import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const VectorL: FunctionComponent<{
  height: number;
  color: string;
}> = ({ height, color }) => {
  return (
    <Svg
      fillRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit="2"
      clipRule="evenodd"
      viewBox="0 0 22 35"
      style={{
        height,
        aspectRatio: 22 / 35,
      }}
    >
      <Path
        fill={color}
        fillRule="nonzero"
        d="M482.069 162.586v5.45h-21.9v-34.65h6.3v29.2h15.6z"
        transform="translate(-460.169 -133.386)"
      />
    </Svg>
  );
};
