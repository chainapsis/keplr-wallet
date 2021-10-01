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
      viewBox="0 0 14 23"
      style={{
        height,
        aspectRatio: 14 / 23,
      }}
    >
      <Path
        fill={color}
        fillRule="nonzero"
        d="M.276.012a.245.245 0 01-.108-.026.21.21 0 01-.087-.083l.052-.051c.019.03.04.052.066.066.025.014.05.021.075.021.047 0 .082-.013.104-.038C.399-.124.41-.163.41-.217v-.37H.135v-.07h.358v.447a.337.337 0 01-.011.086.17.17 0 01-.036.071.18.18 0 01-.067.047.26.26 0 01-.103.018z"
        transform="translate(-618.737 -23.744) translate(616.037 45.644) scale(33.3333)"
      />
    </Svg>
  );
};
