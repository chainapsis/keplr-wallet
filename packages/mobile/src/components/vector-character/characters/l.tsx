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
      viewBox="0 0 14 22"
      style={{
        height,
        aspectRatio: 14 / 22,
      }}
    >
      <Path
        fill={color}
        fillRule="nonzero"
        d="M.134 0v-.656h.082v.585h.325V0H.134z"
        transform="translate(-700.504 -23.777) translate(696.037 45.644) scale(33.3333)"
      />
    </Svg>
  );
};
