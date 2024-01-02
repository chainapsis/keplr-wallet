import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const VectorN: FunctionComponent<{
  height: number;
  color: string;
}> = ({ height, color }) => {
  return (
    <Svg
      fillRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit="2"
      clipRule="evenodd"
      viewBox="0 0 29 35"
      style={{
        height,
        aspectRatio: 29 / 35,
      }}
    >
      <Path
        fill={color}
        fillRule="nonzero"
        d="M554.419 168.036c-1.133-1.9-2.4-3.942-3.8-6.125s-2.85-4.383-4.35-6.6a176.2 176.2 0 00-4.575-6.45 122.346 122.346 0 00-4.425-5.625v24.8h-6.2v-34.65h5.15c1.334 1.4 2.767 3.058 4.3 4.975a240.37 240.37 0 014.625 5.975c1.55 2.067 3.05 4.142 4.5 6.225a151.938 151.938 0 013.875 5.825v-23h6.25v34.65h-5.35z"
        transform="translate(-531.069 -133.386)"
      />
    </Svg>
  );
};
