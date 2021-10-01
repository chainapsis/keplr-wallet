import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const VectorR: FunctionComponent<{
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
        d="M.1 0v-.656h.204c.033 0 .064.003.092.009a.21.21 0 01.073.032c.02.015.036.034.047.057a.2.2 0 01.017.086.18.18 0 01-.04.123.2.2 0 01-.107.063L.553 0H.458L.3-.277H.183V0H.1zm.083-.345h.109A.19.19 0 00.41-.377c.027-.021.04-.052.04-.095 0-.043-.013-.074-.04-.091a.224.224 0 00-.118-.026H.183v.244z"
        transform="translate(-939.37 -23.777) translate(936.037 45.644) scale(33.3333)"
      />
    </Svg>
  );
};
