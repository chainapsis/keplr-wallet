import React, { FunctionComponent } from "react";
import { useStyle } from "../../../styles";
import Svg, { Path } from "react-native-svg";

export const BackButtonIcon: FunctionComponent<{
  color: string;
  height: number;
}> = ({ color, height }) => {
  return (
    <Svg
      fill="none"
      viewBox="0 0 10 18"
      style={{
        height,
        aspectRatio: 10 / 18,
      }}
    >
      <Path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M8.53 17L1 9l7.53-8"
      />
    </Svg>
  );
};

export const HeaderBackButton: FunctionComponent = () => {
  const style = useStyle();

  return (
    <BackButtonIcon
      color={style.get("color-text-black-high").color}
      height={16}
    />
  );
};
