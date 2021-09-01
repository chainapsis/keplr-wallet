import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const VectorM: FunctionComponent<{
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
        d="M.072 0v-.656h.102l.092.28.032.106h.004l.031-.106.093-.28h.102V0h-.08v-.328c0-.016 0-.035.002-.056l.004-.063.004-.062.004-.051H.459l-.037.128-.094.258h-.06L.176-.432.138-.56H.136l.005.051.004.062.004.063.001.056V0H.072z"
        transform="translate(-738.437 -23.777) translate(736.037 45.644) scale(33.3333)"
      />
    </Svg>
  );
};
