import React, {FunctionComponent} from 'react';
import Svg, {Path} from 'react-native-svg';
import {IconProps} from './types';

export const CodeBracketIcon: FunctionComponent<IconProps> = ({
  size = 12,
  color,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <Path
        d="M8.625 3.375L11.25 6L8.625 8.625M3.375 8.625L0.75 6L3.375 3.375M7.125 1.875L4.875 10.125"
        stroke={color || 'currentColor'}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
