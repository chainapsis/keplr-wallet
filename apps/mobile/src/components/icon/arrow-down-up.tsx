import React, {FunctionComponent} from 'react';
import {IconProps} from './types';
import {Path, Svg} from 'react-native-svg';

export const ArrowDownUpIcon: FunctionComponent<IconProps> = ({
  size,
  color,
}) => {
  return (
    <Svg width={size} height={size * 2.5} viewBox="0 0 6 14" fill="none">
      <Path
        d="M3.00002 0L5.59811 5.25003H0.401926L3.00002 0Z"
        fill={color || 'currentColor'}
      />
      <Path
        d="M2.99998 14L0.401894 8.74997L5.59807 8.74997L2.99998 14Z"
        fill={color || 'currentColor'}
      />
    </Svg>
  );
};
