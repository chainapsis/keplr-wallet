import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const VectorG: FunctionComponent<{
  height: number;
  color: string;
}> = ({ height, color }) => {
  return (
    <Svg
      fillRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit="2"
      clipRule="evenodd"
      viewBox="0 0 16 23"
      style={{
        height,
        aspectRatio: 16 / 23,
      }}
    >
      <Path
        fill={color}
        fillRule="nonzero"
        d="M.337.012a.287.287 0 01-.114-.023.247.247 0 01-.09-.067.306.306 0 01-.059-.107.453.453 0 01-.021-.143c0-.053.007-.1.022-.143a.301.301 0 01.06-.107.257.257 0 01.092-.067.294.294 0 01.177-.016.325.325 0 01.05.018.287.287 0 01.071.055l-.047.053a.168.168 0 00-.134-.06.187.187 0 00-.083.018.195.195 0 00-.065.053.235.235 0 00-.041.084.421.421 0 00-.001.221.238.238 0 00.039.085.182.182 0 00.063.054.184.184 0 00.086.019.197.197 0 00.065-.011A.137.137 0 00.456-.1v-.171H.325V-.34h.208v.276a.273.273 0 01-.196.076z"
        transform="translate(-497.804 -23.377) translate(496.037 45.644) scale(33.3333)"
      />
    </Svg>
  );
};
