import React, {FunctionComponent} from 'react';
import Svg, {Path} from 'react-native-svg';
import {IconProps} from './types';

export const QRScanIcon: FunctionComponent<IconProps> = ({color, size}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <Path
        d="M18.375 24.5H21.4375C22.2497 24.5 23.0287 24.1773 23.603 23.603C24.1773 23.0287 24.5 22.2497 24.5 21.4375V18.375M24.5 9.625V6.5625C24.5 5.75027 24.1773 4.97132 23.603 4.39699C23.0287 3.82266 22.2497 3.5 21.4375 3.5H18.375M9.625 24.5H6.5625C5.75027 24.5 4.97132 24.1773 4.39699 23.603C3.82266 23.0287 3.5 22.2497 3.5 21.4375V18.375M3.5 9.625V6.5625C3.5 5.75027 3.82266 4.97132 4.39699 4.39699C4.97132 3.82266 5.75027 3.5 6.5625 3.5H9.625"
        stroke={color || 'currentColor'}
        strokeWidth="2.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
