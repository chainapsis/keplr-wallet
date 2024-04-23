import React, {FunctionComponent} from 'react';
import {IconProps} from './types';
import {Path, Svg} from 'react-native-svg';

export const ArrowLeftIcon: FunctionComponent<IconProps> = ({size, color}) => {
  return (
    <Svg width={size} height={size} fill="none" viewBox="0 0 24 24">
      <Path
        fill="none"
        stroke={color || 'currentColor'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
        d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
      />
    </Svg>
  );
};
