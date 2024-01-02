import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const VectorV: FunctionComponent<{
  height: number;
  color: string;
}> = ({ height, color }) => {
  return (
    <Svg
      fillRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit="2"
      clipRule="evenodd"
      viewBox="0 0 34 35"
      style={{
        height,
        aspectRatio: 34 / 35,
      }}
    >
      <Path
        fill={color}
        fillRule="nonzero"
        d="M810.419 168.036c-2.5-5.4-4.908-11.05-7.225-16.95-2.316-5.9-4.475-11.8-6.475-17.7h6.95l2.45 7.15a729.843 729.843 0 002.5 7.175c.834 2.35 1.667 4.625 2.5 6.825.834 2.2 1.65 4.217 2.45 6.05a205.231 205.231 0 002.4-6.025 361.328 361.328 0 002.525-6.825c.85-2.367 1.692-4.767 2.525-7.2a580.771 580.771 0 002.4-7.15h6.75c-2.033 5.9-4.2 11.8-6.5 17.7-2.3 5.9-4.7 11.55-7.2 16.95h-6.05z"
        transform="translate(-796.719 -133.386)"
      />
    </Svg>
  );
};
