import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const VectorU: FunctionComponent<{
  height: number;
  color: string;
}> = ({ height, color }) => {
  return (
    <Svg
      fillRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit="2"
      clipRule="evenodd"
      viewBox="0 0 28 36"
      style={{
        height,
        aspectRatio: 28 / 36,
      }}
    >
      <Path
        fill={color}
        fillRule="nonzero"
        d="M778.719 168.786c-2.366 0-4.4-.342-6.1-1.025-1.7-.683-3.108-1.642-4.225-2.875-1.116-1.233-1.941-2.683-2.475-4.35-.533-1.667-.8-3.5-.8-5.5v-21.65h6.35v21.05c0 1.567.175 2.908.525 4.025.35 1.117.85 2.025 1.5 2.725.65.7 1.417 1.217 2.3 1.55.884.333 1.875.5 2.975.5s2.1-.167 3-.5c.9-.333 1.675-.85 2.325-1.55.65-.7 1.15-1.608 1.5-2.725.35-1.117.525-2.458.525-4.025v-21.05h6.35v21.65c0 2-.275 3.833-.825 5.5-.55 1.667-1.383 3.117-2.5 4.35-1.116 1.233-2.541 2.192-4.275 2.875-1.733.683-3.783 1.025-6.15 1.025z"
        transform="translate(-765.119 -133.386)"
      />
    </Svg>
  );
};
