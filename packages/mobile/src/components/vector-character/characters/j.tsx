import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const VectorJ: FunctionComponent<{
  height: number;
  color: string;
}> = ({ height, color }) => {
  return (
    <Svg
      fillRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit="2"
      clipRule="evenodd"
      viewBox="0 0 22 36"
      style={{
        height,
        aspectRatio: 22 / 36,
      }}
    >
      <Path
        fill={color}
        fillRule="nonzero"
        d="M419.569 156.636c0 1.7-.183 3.283-.55 4.75-.366 1.467-1.008 2.75-1.925 3.85-.916 1.1-2.15 1.967-3.7 2.6-1.55.633-3.508.95-5.875.95-2.2 0-4.108-.308-5.725-.925-1.616-.617-2.858-1.275-3.725-1.975l2.25-4.95c.834.567 1.859 1.108 3.075 1.625a9.445 9.445 0 003.725.775c2.134 0 3.684-.533 4.65-1.6.967-1.067 1.45-2.9 1.45-5.5v-22.85h6.35v23.25z"
        transform="translate(-398.069 -133.386)"
      />
    </Svg>
  );
};
