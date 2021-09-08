import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const VectorW: FunctionComponent<{
  height: number;
  color: string;
}> = ({ height, color }) => {
  return (
    <Svg
      fillRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit="2"
      clipRule="evenodd"
      viewBox="0 0 20 22"
      style={{
        height,
        aspectRatio: 20 / 22,
      }}
    >
      <Path
        fill={color}
        fillRule="nonzero"
        d="M.11 0l-.1-.657h.094l.048.412.004.038.004.034.003.037.002.043h.003l.008-.043.008-.037.007-.034L.2-.244l.064-.244h.08l.062.244.009.037.008.034.007.037.008.043h.004a2.958 2.958 0 01.006-.08l.003-.034.003-.037L.5-.657h.09L.494 0H.39L.326-.264a1.03 1.03 0 01-.024-.118H.299l-.01.059a.7.7 0 01-.013.059L.212 0H.11z"
        transform="translate(-1136.37 -23.744) translate(1136.04 45.644) scale(33.3333)"
      />
    </Svg>
  );
};
