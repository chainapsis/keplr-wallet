import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const VectorY: FunctionComponent<{
  height: number;
  color: string;
}> = ({ height, color }) => {
  return (
    <Svg
      fillRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit="2"
      clipRule="evenodd"
      viewBox="0 0 18 22"
      style={{
        height,
        aspectRatio: 18 / 22,
      }}
    >
      <Path
        fill={color}
        fillRule="nonzero"
        d="M.258 0v-.234l-.22-.422h.088l.099.195.037.075.038.078h.004l.077-.154.095-.194h.086l-.22.422V0H.258z"
        transform="translate(-1217.3 -23.777) translate(1216.04 45.644) scale(33.3333)"
      />
    </Svg>
  );
};
