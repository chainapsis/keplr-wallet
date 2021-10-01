import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const VectorN: FunctionComponent<{
  height: number;
  color: string;
}> = ({ height, color }) => {
  return (
    <Svg
      fillRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit="2"
      clipRule="evenodd"
      viewBox="0 0 15 22"
      style={{
        height,
        aspectRatio: 15 / 22,
      }}
    >
      <Path
        fill={color}
        fillRule="nonzero"
        d="M.082 0v-.656h.092l.21.412.063.136h.002a1.947 1.947 0 00-.006-.103 1.23 1.23 0 01-.005-.105v-.34h.08V0H.426l-.21-.412-.063-.136H.151c.001.034.004.068.007.102.003.035.004.069.004.103V0h-.08z"
        transform="translate(-778.77 -23.777) translate(776.037 45.644) scale(33.3333)"
      />
    </Svg>
  );
};
