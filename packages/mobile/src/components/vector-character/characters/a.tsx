import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const VectorA: FunctionComponent<{
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
        d="M.232-.367l-.031.1h.196l-.031-.1C.355-.404.343-.44.333-.477a2.936 2.936 0 01-.032-.111H.297l-.032.111-.033.11zM.032 0l.221-.656h.094L.568 0H.48L.418-.2H.18L.117 0H.032z"
        transform="translate(-257.104 -23.777) translate(256.037 45.644) scale(33.3333)"
      />
    </Svg>
  );
};
