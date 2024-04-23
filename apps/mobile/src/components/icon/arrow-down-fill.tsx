import React, {FunctionComponent} from 'react';
import {IconProps} from './types';
import {Path, Svg} from 'react-native-svg';

export const ArrowDownFillIcon: FunctionComponent<IconProps> = ({
  size,
  color,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12.7827 16.9932C12.3855 17.5038 11.6137 17.5038 11.2166 16.9932L4.84487 8.80101C4.33806 8.14939 4.80242 7.19995 5.62792 7.19995H18.3713C19.1968 7.19995 19.6612 8.14939 19.1543 8.80101L12.7827 16.9932Z"
        fill={color || 'currentColor'}
      />
    </Svg>
  );
};
