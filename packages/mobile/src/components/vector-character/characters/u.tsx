import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const VectorU: FunctionComponent<{
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
        d="M.301.012a.281.281 0 01-.089-.014.165.165 0 01-.07-.046.208.208 0 01-.046-.08.381.381 0 01-.017-.12v-.408h.084v.41a.3.3 0 00.011.086.14.14 0 00.029.057.104.104 0 00.043.032c.017.007.035.01.055.01.02 0 .038-.003.055-.01A.113.113 0 00.4-.103.14.14 0 00.43-.16a.344.344 0 00.01-.086v-.41h.081v.408a.383.383 0 01-.016.12.222.222 0 01-.046.08.162.162 0 01-.069.046.281.281 0 01-.089.014z"
        transform="translate(-1058.67 -23.777) translate(1056.04 45.644) scale(33.3333)"
      />
    </Svg>
  );
};
