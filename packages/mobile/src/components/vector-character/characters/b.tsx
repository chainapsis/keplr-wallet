import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const VectorB: FunctionComponent<{
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
        d="M.099 0v-.656h.186c.033 0 .064.003.092.009a.215.215 0 01.071.028.144.144 0 01.046.049.155.155 0 01.016.074.144.144 0 01-.028.088.145.145 0 01-.087.055v.004a.197.197 0 01.112.05c.027.026.04.062.04.107a.171.171 0 01-.068.144.233.233 0 01-.078.036A.4.4 0 01.3 0H.099zm.083-.38h.089c.056 0 .096-.009.121-.027.024-.018.036-.045.036-.082C.428-.525.415-.55.39-.565a.248.248 0 00-.115-.021H.182v.206zm0 .31h.106c.057 0 .1-.01.131-.03.031-.019.046-.051.046-.096 0-.041-.015-.07-.045-.088A.272.272 0 00.288-.31H.182v.24z"
        transform="translate(-299.337 -23.777) translate(296.037 45.644) scale(33.3333)"
      />
    </Svg>
  );
};
