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
      viewBox="0 0 14 22"
      style={{
        height,
        aspectRatio: 14 / 22,
      }}
    >
      <Path
        fill={color}
        fillRule="nonzero"
        d="M.095 0v-.071h.163v-.515H.095v-.07h.41v.07H.342v.515h.163V0h-.41z"
        transform="translate(-579.204 -23.777) translate(576.037 45.644) scale(33.3333)"
      />
    </Svg>
  );
};
