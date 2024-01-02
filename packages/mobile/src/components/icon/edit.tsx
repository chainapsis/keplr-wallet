import React, { FunctionComponent } from "react";
import Svg, { Path, G } from "react-native-svg";

export const EditIcon: FunctionComponent<{
  color: string;
  size: number;
}> = ({ color = "#000000", size = 24 }) => {
  return (
    <Svg
      width={size}
      height={size}
      fill="none"
      viewBox="0,0,256,256"
      style={{
        width: size,
        height: size,
      }}
    >
      <G
        fill={color}
        fill-rule="nonzero"
        stroke="none"
        stroke-width="1"
        stroke-linecap="butt"
        stroke-linejoin="miter"
        stroke-miterlimit="10"
        stroke-dasharray=""
        stroke-dashoffset="0"
        font-family="none"
        font-weight="none"
        font-size="none"
        text-anchor="none"
        style="mix-blend-mode: normal"
      >
        <G transform="scale(10.66667,10.66667)">
          <Path d="M18,2l-2.41406,2.41406l4,4l2.41406,-2.41406zM14.07617,5.92383l-11.07617,11.07617v4h4l11.07617,-11.07617z" />
        </G>
      </G>
    </Svg>
  );
};
