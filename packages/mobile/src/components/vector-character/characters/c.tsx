import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const VectorC: FunctionComponent<{
  height: number;
  color: string;
}> = ({ height, color }) => {
  return (
    <Svg
      fillRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit="2"
      clipRule="evenodd"
      viewBox="0 0 17 23"
      style={{
        height,
        aspectRatio: 17 / 23,
      }}
    >
      <Path
        fill={color}
        fillRule="nonzero"
        d="M.351.012a.282.282 0 01-.113-.023.247.247 0 01-.09-.067.31.31 0 01-.061-.107.425.425 0 01-.022-.143c0-.053.007-.1.022-.142a.319.319 0 01.061-.107.273.273 0 01.316-.067c.03.016.055.035.074.056l-.047.053a.222.222 0 00-.058-.044.196.196 0 00-.159.002.189.189 0 00-.066.053.255.255 0 00-.042.084.375.375 0 00-.015.11c0 .041.005.078.015.111a.26.26 0 00.042.085.183.183 0 00.151.073c.03 0 .057-.006.081-.019a.274.274 0 00.067-.054l.047.051a.293.293 0 01-.088.07.247.247 0 01-.115.025z"
        transform="translate(-338.204 -23.377) translate(336.037 45.644) scale(33.3333)"
      />
    </Svg>
  );
};
