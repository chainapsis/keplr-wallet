import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const VectorV: FunctionComponent<{
  height: number;
  color: string;
}> = ({ height, color }) => {
  return (
    <Svg
      fillRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit="2"
      clipRule="evenodd"
      viewBox="0 0 18 22"
      style={{
        height,
        aspectRatio: 18 / 22,
      }}
    >
      <Path
        fill={color}
        fillRule="nonzero"
        d="M.252 0L.043-.656h.088l.106.354.031.109.032.108h.004l.017-.056.016-.052.015-.053a4.33 4.33 0 00.015-.056l.105-.354h.085L.349 0H.252z"
        transform="translate(-1097.47 -23.777) translate(1096.04 45.644) scale(33.3333)"
      />
    </Svg>
  );
};
