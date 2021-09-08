import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const VectorZ: FunctionComponent<{
  height: number;
  color: string;
}> = ({ height, color }) => {
  return (
    <Svg
      fillRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit="2"
      clipRule="evenodd"
      viewBox="0 0 16 22"
      style={{
        height,
        aspectRatio: 16 / 22,
      }}
    >
      <Path
        fill={color}
        fillRule="nonzero"
        d="M.065 0v-.05l.366-.537H.097v-.07h.437v.05l-.367.536h.372V0H.065z"
        transform="translate(-1258.2 -23.744) translate(1256.04 45.644) scale(33.3333)"
      />
    </Svg>
  );
};
