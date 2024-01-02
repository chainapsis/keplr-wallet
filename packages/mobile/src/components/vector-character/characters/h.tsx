import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const VectorH: FunctionComponent<{
  height: number;
  color: string;
}> = ({ height, color }) => {
  return (
    <Svg
      fillRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit="2"
      clipRule="evenodd"
      viewBox="0 0 28 35"
      style={{
        height,
        aspectRatio: 28 / 35,
      }}
    >
      <Path
        fill={color}
        fillRule="nonzero"
        d="M372.769 133.386h6.3v34.65h-6.3v-15.35h-15.05v15.35h-6.3v-34.65h6.3v13.85h15.05v-13.85z"
        transform="translate(-351.419 -133.386)"
      />
    </Svg>
  );
};
