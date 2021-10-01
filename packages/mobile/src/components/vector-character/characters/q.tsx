import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const VectorQ: FunctionComponent<{
  height: number;
  color: string;
}> = ({ height, color }) => {
  return (
    <Svg
      fillRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit="2"
      clipRule="evenodd"
      viewBox="0 0 17 28"
      style={{
        height: height + 5,
        marginTop: 5,
        aspectRatio: 17 / 28,
      }}
    >
      <Path
        fill={color}
        fillRule="nonzero"
        d="M.3-.057c.051 0 .091-.024.121-.072a.39.39 0 00.044-.202.37.37 0 00-.044-.195C.391-.573.351-.597.3-.597a.135.135 0 00-.12.071.36.36 0 00-.045.195.38.38 0 00.045.202c.029.048.069.072.12.072zm.181.22A.223.223 0 01.26.009a.198.198 0 01-.086-.035.237.237 0 01-.066-.071.337.337 0 01-.043-.102.532.532 0 01-.015-.132c0-.053.006-.1.018-.142A.322.322 0 01.119-.58a.227.227 0 01.079-.066A.231.231 0 01.3-.669c.037 0 .071.008.102.023a.227.227 0 01.079.066.322.322 0 01.051.107.573.573 0 01.004.271.395.395 0 01-.041.102.24.24 0 01-.064.07.195.195 0 01-.083.037c.011.029.029.05.054.064a.176.176 0 00.116.018.103.103 0 00.021-.007l.016.067-.035.01a.161.161 0 01-.039.004z"
        transform="translate(-897.704 -23.344) translate(896.037 45.644) scale(33.3333)"
      />
    </Svg>
  );
};
