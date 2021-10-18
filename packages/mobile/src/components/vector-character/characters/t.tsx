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
      viewBox="0 0 18 22"
      style={{
        height,
        aspectRatio: 18 / 22,
      }}
    >
      <Path
        fill={color}
        fillRule="nonzero"
        d="M.258 0v-.586H.042v-.07h.516v.07H.342V0H.258z"
        transform="translate(-1017.44 -23.777) translate(1016.04 45.644) scale(33.3333)"
      />
    </Svg>
  );
};
