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
      viewBox="0 0 28 35"
      style={{
        height,
        aspectRatio: 28 / 35,
      }}
    >
      <Path
        fill={color}
        fillRule="nonzero"
        d="M686.969 133.036c5 0 8.825.917 11.475 2.75 2.65 1.833 3.975 4.633 3.975 8.4 0 4.7-2.316 7.883-6.95 9.55.634.767 1.35 1.7 2.15 2.8a82.078 82.078 0 014.85 7.525 53.128 53.128 0 012.05 3.975h-7.05a72.68 72.68 0 00-2.05-3.625c-.733-1.217-1.475-2.4-2.225-3.55a83.466 83.466 0 00-4.275-5.975c-.466.033-.866.05-1.2.05h-4v13.1h-6.3v-34.15a33.843 33.843 0 014.9-.675 69.79 69.79 0 014.65-.175zm.45 5.45c-1.333 0-2.566.05-3.7.15v11.2h2.75c1.534 0 2.884-.083 4.05-.25 1.167-.167 2.142-.467 2.925-.9.784-.433 1.375-1.017 1.775-1.75.4-.733.6-1.667.6-2.8 0-1.067-.2-1.967-.6-2.7a4.463 4.463 0 00-1.725-1.75c-.75-.433-1.641-.742-2.675-.925a19.533 19.533 0 00-3.4-.275z"
        transform="translate(-677.419 -133.036)"
      />
    </Svg>
  );
};
