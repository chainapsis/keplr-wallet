import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const VectorQuestionMark: FunctionComponent<{
  height: number;
  color: string;
}> = ({ height, color }) => {
  return (
    <Svg
      fillRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit="2"
      clipRule="evenodd"
      viewBox="0 0 13 24"
      style={{
        height,
        aspectRatio: 13 / 24,
      }}
    >
      <Path
        fill={color}
        fillRule="nonzero"
        d="M.242-.232a.135.135 0 01.003-.064.156.156 0 01.027-.051.262.262 0 01.039-.043l.042-.04a.234.234 0 00.032-.04.085.085 0 00.013-.047.097.097 0 00-.027-.07C.352-.605.325-.614.288-.614a.163.163 0 00-.07.015.228.228 0 00-.06.043L.109-.601a.293.293 0 01.08-.058.258.258 0 01.18-.012.184.184 0 01.059.031c.016.014.028.03.038.049a.151.151 0 01.013.065.126.126 0 01-.013.06.314.314 0 01-.075.089.397.397 0 00-.041.041.166.166 0 00-.029.047.107.107 0 00-.006.057H.242zm.044.244a.074.074 0 01-.073-.078c0-.023.007-.042.022-.056a.077.077 0 01.103 0 .076.076 0 01.021.056.077.077 0 01-.021.057.073.073 0 01-.052.021z"
        transform="translate(-1299.67 -22.91) translate(1296.04 45.644) scale(33.3333)"
      />
    </Svg>
  );
};
