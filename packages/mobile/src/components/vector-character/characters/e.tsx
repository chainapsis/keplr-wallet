import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const VectorE: FunctionComponent<{
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
        d="M.114 0v-.656H.52v.07H.198v.206H.47v.071H.198v.238H.53V0H.114z"
        transform="translate(-419.837 -23.777) translate(416.037 45.644) scale(33.3333)"
      />
    </Svg>
  );
};
