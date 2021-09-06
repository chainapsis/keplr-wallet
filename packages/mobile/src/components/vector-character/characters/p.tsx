import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const VectorP: FunctionComponent<{
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
        d="M.102 0v-.656H.3c.036 0 .069.003.099.01s.056.018.077.032a.155.155 0 01.05.06.224.224 0 01.017.091.222.222 0 01-.017.09.182.182 0 01-.127.1A.344.344 0 01.3-.26H.185V0H.102zm.083-.328H.29c.058 0 .101-.011.128-.033.027-.021.041-.055.041-.102 0-.047-.014-.08-.042-.099A.238.238 0 00.29-.589H.185v.261z"
        transform="translate(-859.437 -23.777) translate(856.037 45.644) scale(33.3333)"
      />
    </Svg>
  );
};
