import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const VectorD: FunctionComponent<{
  height: number;
  color: string;
}> = ({ height, color }) => {
  return (
    <Svg
      fillRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit="2"
      clipRule="evenodd"
      viewBox="0 0 30 36"
      style={{
        height,
        aspectRatio: 30 / 36,
      }}
    >
      <Path
        fill={color}
        fillRule="nonzero"
        d="M231.469 162.836c.367.033.85.058 1.45.075.6.017 1.417.025 2.45.025 4.234 0 7.392-1.075 9.475-3.225 2.084-2.15 3.125-5.158 3.125-9.025 0-3.933-1.016-6.95-3.05-9.05-2.033-2.1-5.183-3.15-9.45-3.15-1.866 0-3.2.05-4 .15v24.2zm23.1-12.15c0 3-.466 5.608-1.4 7.825-.933 2.217-2.258 4.067-3.975 5.55-1.716 1.483-3.783 2.583-6.2 3.3-2.416.717-5.091 1.075-8.025 1.075-1.4 0-2.983-.058-4.75-.175a32.048 32.048 0 01-5.05-.725v-33.65c1.6-.367 3.3-.6 5.1-.7 1.8-.1 3.4-.15 4.8-.15 2.9 0 5.55.342 7.95 1.025 2.4.683 4.459 1.75 6.175 3.2 1.717 1.45 3.042 3.283 3.975 5.5.934 2.217 1.4 4.858 1.4 7.925z"
        transform="translate(-225.169 -133.036)"
      />
    </Svg>
  );
};
