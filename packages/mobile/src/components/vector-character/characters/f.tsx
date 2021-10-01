import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const VectorF: FunctionComponent<{
  height: number;
  color: string;
}> = ({ height, color }) => {
  return (
    <Svg
      fillRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit="2"
      clipRule="evenodd"
      viewBox="0 0 14 22"
      style={{
        height,
        aspectRatio: 14 / 22,
      }}
    >
      <Path
        fill={color}
        fillRule="nonzero"
        d="M.133 0v-.656h.403v.07H.217v.222h.27v.07h-.27V0H.133z"
        transform="translate(-460.47 -23.777) translate(456.037 45.644) scale(33.3333)"
      />
    </Svg>
  );
};
