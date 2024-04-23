import React, {FunctionComponent} from 'react';
import Svg, {Path} from 'react-native-svg';
import {IconProps} from './types';

export const CloseIcon: FunctionComponent<IconProps> = ({size = 16, color}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 18L18 6M6 6L18 18"
        stroke={color || 'currentColor'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
