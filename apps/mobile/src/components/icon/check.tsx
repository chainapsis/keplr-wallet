import React, {FunctionComponent} from 'react';
import {IconProps} from './types';
import {Path, Svg} from 'react-native-svg';

export const CheckIcon: FunctionComponent<IconProps> = ({size = 16, color}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 17 17" fill="none">
      <Path
        d="M6.92491 10.8351L4.14491 8.05507L3.19824 8.99507L6.92491 12.7217L14.9249 4.72174L13.9849 3.78174L6.92491 10.8351Z"
        fill={color || 'currentColor'}
      />
    </Svg>
  );
};
