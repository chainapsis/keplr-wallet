import React, {FunctionComponent} from 'react';
import {IconProps} from './types';
import {Circle, Path, Rect, Svg} from 'react-native-svg';

export const CosmosIcon: FunctionComponent<IconProps> = ({size}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <Rect
        x="6.375"
        y="6.375"
        width="46.5"
        height="46.5"
        rx="11.7722"
        fill="#424247"
      />
      <Circle
        cx="29.8662"
        cy="29.8662"
        r="9.11835"
        stroke="#F6F6F9"
        strokeWidth="3.03087"
      />
      <Path
        d="M40.5009 18.748L18.75 40.499"
        stroke="#F6F6F9"
        strokeWidth="3.03087"
      />
    </Svg>
  );
};
