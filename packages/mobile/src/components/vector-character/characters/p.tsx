import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const VectorP: FunctionComponent<{
  height: number;
  color: string;
}> = ({ height, color }) => {
  return (
    <Svg
      fillRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit="2"
      clipRule="evenodd"
      viewBox="0 0 26 35"
      style={{
        height,
        aspectRatio: 26 / 35,
      }}
    >
      <Path
        fill={color}
        fillRule="nonzero"
        d="M616.969 133.036c5.034 0 8.892.917 11.575 2.75 2.684 1.833 4.025 4.7 4.025 8.6 0 2.033-.358 3.775-1.075 5.225a9.025 9.025 0 01-3.125 3.55c-1.366.917-3.033 1.592-5 2.025-1.966.433-4.216.65-6.75.65h-3.15v12.2h-6.3v-34.15c1.467-.333 3.092-.558 4.875-.675a75.645 75.645 0 014.925-.175zm.45 5.45c-1.6 0-2.916.05-3.95.15v11.8h3.05c3.034 0 5.367-.425 7-1.275 1.634-.85 2.45-2.458 2.45-4.825 0-1.133-.216-2.083-.65-2.85a4.661 4.661 0 00-1.8-1.8c-.766-.433-1.675-.742-2.725-.925a19.662 19.662 0 00-3.375-.275z"
        transform="translate(-607.169 -133.036)"
      />
    </Svg>
  );
};
