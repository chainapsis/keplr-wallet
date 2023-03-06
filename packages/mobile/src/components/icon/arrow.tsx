import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const RightArrowIcon: FunctionComponent<{
  color: string;
  height: number;
}> = ({ color, height }) => {
  return (
    <Svg
      fillRule="evenodd"
      strokeLinecap="round"
      strokeLinejoin="round"
      clipRule="evenodd"
      viewBox="0 0 8 14"
      style={{
        height,
        aspectRatio: 8 / 14,
      }}
    >
      <Path
        fill="none"
        fillRule="nonzero"
        stroke={color}
        strokeWidth="2"
        d="M1.188 1.375L6.813 7l-5.625 5.625"
        transform="translate(-.139 -.243) scale(1.03469)"
      />
    </Svg>
  );
};

export const DoubleRightArrowIcon: FunctionComponent<{
  color: string;
  height: number;
}> = ({ color, height }) => {
  return (
    <Svg
      viewBox="0 0 18 19"
      style={{
        height,
        aspectRatio: 18 / 19,
      }}
    >
      <Path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M8.833 1.833l7.875 7.875-7.875 7.875"
      />
      <Path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M1.833 1.833l7.875 7.875-7.875 7.875"
      />
    </Svg>
  );
};

export const UpArrowIcon: FunctionComponent<{
  color: string;
  size: number;
}> = ({ color, size }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M3.5 10.25L8 5.75L12.5 10.25"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const DownArrowIcon: FunctionComponent<{
  color: string;
  size: number;
}> = ({ color, size }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M12.5 6.4165L8 10.9165L3.5 6.4165"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
