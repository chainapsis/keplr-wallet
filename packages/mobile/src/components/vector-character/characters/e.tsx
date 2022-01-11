import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const VectorE: FunctionComponent<{
  height: number;
  color: string;
}> = ({ height, color }) => {
  return (
    <Svg
      fillRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit="2"
      clipRule="evenodd"
      viewBox="0 0 24 35"
      style={{
        height,
        aspectRatio: 24 / 35,
      }}
    >
      <Path
        fill={color}
        fillRule="nonzero"
        d="M261.469 168.036v-34.65h22.25v5.35h-15.95v8.55h14.2v5.25h-14.2v10.15h17.15v5.35h-23.45z"
        transform="translate(-261.469 -133.386)"
      />
    </Svg>
  );
};
