import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const VectorD: FunctionComponent<{
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
        d="M.087 0v-.656h.162c.099 0 .175.028.227.084.051.056.077.136.077.241a.357.357 0 01-.077.244C.424-.029.35 0 .253 0H.087zM.17-.068h.073c.075 0 .132-.023.169-.069a.303.303 0 00.055-.194c0-.083-.018-.147-.055-.191C.375-.566.318-.588.243-.588H.17v.52z"
        transform="translate(-378.937 -23.777) translate(376.037 45.644) scale(33.3333)"
      />
    </Svg>
  );
};
