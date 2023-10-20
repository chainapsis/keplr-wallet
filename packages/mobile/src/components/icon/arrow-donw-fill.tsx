import React, {FunctionComponent} from 'react';
import {IconProps} from './types';
import {G, Path, Svg} from 'react-native-svg';

export const ArrowDownFillIcon: FunctionComponent<IconProps> = ({
  size,
  color,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <G id="ri:arrow-drop-down-fill">
        <Path
          id="Vector"
          d="M10.7894 13.9851C10.389 14.4999 9.61101 14.4999 9.21065 13.9851L4.25529 7.61394C3.7444 6.95708 4.21249 6 5.04464 6H14.9554C15.7875 6 16.2556 6.95708 15.7447 7.61394L10.7894 13.9851Z"
          fill={color || 'currentColor'}
        />
      </G>
    </Svg>
  );
};
