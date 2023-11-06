import React, {FunctionComponent} from 'react';
import {IconProps} from './types';
import {Path, Svg} from 'react-native-svg';

export const PlusIcon: FunctionComponent<IconProps> = ({size, color}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <Path
        d="M14 5.25V22.75M22.75 14L5.25 14"
        stroke={color || 'currentColor'}
        strokeWidth="2.91667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
