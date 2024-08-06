import React, {FunctionComponent} from 'react';
import {IconProps} from './types';
import {Path, Rect, Svg} from 'react-native-svg';

export const MessageExecuteContractIcon: FunctionComponent<IconProps> = ({
  size,
  color,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Rect
        x="10.6666"
        y="9.86664"
        width="10.2222"
        height="12.2667"
        rx="1.36296"
        stroke={color || 'currentColor'}
      />
      <Path
        d="M13.12 13.5467L18.0266 13.5467"
        stroke={color || 'currentColor'}
        strokeLinecap="round"
      />
      <Path
        d="M13.12 16L16.8 16"
        stroke={color || 'currentColor'}
        strokeLinecap="round"
      />
    </Svg>
  );
};
