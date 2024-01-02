import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const VectorT: FunctionComponent<{
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
        d="M760.569 133.386v5.45h-10.65v29.2h-6.35v-29.2h-10.65v-5.45h27.65z"
        transform="translate(-732.919 -133.386)"
      />
    </Svg>
  );
};
