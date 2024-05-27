import React, {FunctionComponent} from 'react';
import {IconProps} from './types';
import {Path, Svg} from 'react-native-svg';

export const DocumentOutlinedIcon: FunctionComponent<IconProps> = ({
  size,
  color,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 29 29" fill="none">
      <Path
        d="M17.7507 6.16667H8.00065V23.5H21.0007V9.41667H17.7507V6.16667ZM8.00065 4H18.834L23.1673 8.33333V23.5C23.1673 24.0746 22.939 24.6257 22.5327 25.0321C22.1264 25.4384 21.5753 25.6667 21.0007 25.6667H8.00065C7.42602 25.6667 6.87492 25.4384 6.46859 25.0321C6.06226 24.6257 5.83398 24.0746 5.83398 23.5V6.16667C5.83398 5.59203 6.06226 5.04093 6.46859 4.6346C6.87492 4.22827 7.42602 4 8.00065 4ZM10.1673 13.75H18.834V15.9167H10.1673V13.75ZM10.1673 18.0833H18.834V20.25H10.1673V18.0833Z"
        fill={color || 'currentColor'}
      />
    </Svg>
  );
};
