import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const VectorX: FunctionComponent<{
  height: number;
  color: string;
}> = ({ height, color }) => {
  return (
    <Svg
      fillRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit="2"
      clipRule="evenodd"
      viewBox="0 0 32 35"
      style={{
        height,
        aspectRatio: 32 / 35,
      }}
    >
      <Path
        fill={color}
        fillRule="nonzero"
        d="M903.469 168.036c-.966-1.967-2.183-4.133-3.65-6.5-1.466-2.367-3-4.65-4.6-6.85-.666.867-1.391 1.9-2.175 3.1-.783 1.2-1.566 2.425-2.35 3.675a104.895 104.895 0 00-2.175 3.625 63.16 63.16 0 00-1.6 2.95h-7.15c1.5-2.833 3.234-5.742 5.2-8.725a373.53 373.53 0 016.4-9.375l-11.1-16.55h7.5l7.65 11.85 7.55-11.85h7.2l-10.95 16.5c2.534 3.433 4.775 6.683 6.725 9.75 1.95 3.067 3.592 5.867 4.925 8.4h-7.4z"
        transform="translate(-879.769 -133.386)"
      />
    </Svg>
  );
};
