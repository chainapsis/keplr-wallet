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
      viewBox="0 0 15 22"
      style={{
        height,
        aspectRatio: 15 / 22,
      }}
    >
      <Path
        fill={color}
        fillRule="nonzero"
        d="M.079 0v-.656h.084v.275h.274v-.275h.084V0H.437v-.309H.163V0H.079z"
        transform="translate(-538.67 -23.777) translate(536.037 45.644) scale(33.3333)"
      />
    </Svg>
  );
};
