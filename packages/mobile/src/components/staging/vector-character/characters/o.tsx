import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const VectorO: FunctionComponent<{
  height: number;
  color: string;
}> = ({ height, color }) => {
  return (
    <Svg
      fillRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit="2"
      clipRule="evenodd"
      viewBox="0 0 17 23"
      style={{
        height,
        aspectRatio: 17 / 23,
      }}
    >
      <Path
        fill={color}
        fillRule="nonzero"
        d="M.3.012a.22.22 0 01-.181-.091.302.302 0 01-.052-.108.488.488 0 01-.019-.144c0-.053.006-.1.019-.142a.3.3 0 01.052-.106A.217.217 0 01.3-.668a.229.229 0 01.182.089.338.338 0 01.052.106.515.515 0 01.018.142.525.525 0 01-.018.144.34.34 0 01-.052.108A.232.232 0 01.3.012zm0-.073A.125.125 0 00.368-.08a.158.158 0 00.053-.053.302.302 0 00.033-.085.484.484 0 00-.033-.307.155.155 0 00-.053-.052A.133.133 0 00.3-.595a.13.13 0 00-.068.018.144.144 0 00-.052.052.262.262 0 00-.034.083.484.484 0 000 .224.275.275 0 00.034.085.147.147 0 00.052.053c.02.013.043.019.068.019z"
        transform="translate(-817.637 -23.377) translate(816.037 45.644) scale(33.3333)"
      />
    </Svg>
  );
};
