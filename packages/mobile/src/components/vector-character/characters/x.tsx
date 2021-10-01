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
      viewBox="0 0 17 22"
      style={{
        height,
        aspectRatio: 17 / 22,
      }}
    >
      <Path
        fill={color}
        fillRule="nonzero"
        d="M.054 0L.25-.339.067-.656h.092l.092.168.025.044.028.051h.004l.025-.051a.601.601 0 01.022-.044l.09-.168h.088L.35-.335.546 0H.454L.355-.177l-.027-.05-.031-.055H.293a.946.946 0 01-.027.055l-.026.05L.142 0H.054z"
        transform="translate(-1177.84 -23.777) translate(1176.04 45.644) scale(33.3333)"
      />
    </Svg>
  );
};
