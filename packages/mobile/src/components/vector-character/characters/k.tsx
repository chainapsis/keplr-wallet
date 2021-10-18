import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const VectorK: FunctionComponent<{
  height: number;
  color: string;
}> = ({ height, color }) => {
  return (
    <Svg
      fillRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit="2"
      clipRule="evenodd"
      viewBox="0 0 17 22"
      style={{
        height,
        aspectRatio: 17 / 22,
      }}
    >
      <Path
        fill={color}
        fillRule="nonzero"
        d="M.098 0v-.656h.084v.329h.003l.276-.329h.095l-.208.249L.58 0H.486L.295-.344l-.113.135V0H.098z"
        transform="translate(-659.304 -23.777) translate(656.037 45.644) scale(33.3333)"
      />
    </Svg>
  );
};
