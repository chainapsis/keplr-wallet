import React, {FunctionComponent} from 'react';
import Svg, {Path, Rect} from 'react-native-svg';

export interface IconProps {
  size: number;
  color?: string;
}

export const CopyOutlineIcon: FunctionComponent<IconProps> = ({
  size,
  color,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M16 4H6.4C5.07452 4 4 5.07452 4 6.4V16"
        stroke={color || 'currentColor'}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <Rect
        x="8.2"
        y="8.2"
        width="11.6"
        height="11.6"
        rx="1.2"
        stroke={color || 'currentColor'}
        strokeWidth="2.4"
      />
    </Svg>
  );
};
