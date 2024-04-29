import React, {FunctionComponent} from 'react';
import {IconProps} from './types';
import {Defs, Path, Svg, G, ClipPath, Rect} from 'react-native-svg';

export const SwapIcon: FunctionComponent<IconProps> = ({size, color}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <G clipPath="url(#clip0_12491_1417)">
        <Path
          d="M7.20667 12.4286L1 18.7143L7.20667 25V20.2857H18.1111V17.1429H7.20667V12.4286ZM27 9.28571L20.7933 3V7.71429H9.88889V10.8571H20.7933V15.5714L27 9.28571Z"
          fill={color || 'currentColor'}
        />
      </G>
      <Defs>
        <ClipPath id="clip0_12491_1417">
          <Rect width="28" height="28" fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};
