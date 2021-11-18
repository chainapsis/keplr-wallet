import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const VectorF: FunctionComponent<{
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
        d="M290.769 168.036v-34.65h21.9v5.35h-15.6v8.85h13.85v5.35h-13.85v15.1h-6.3z"
        transform="translate(-290.769 -133.386)"
      />
    </Svg>
  );
};
