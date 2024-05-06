import React, {FunctionComponent} from 'react';
import Svg, {Path} from 'react-native-svg';
import {useStyle} from '../../../styles';

export const HeaderBackButtonIcon: FunctionComponent<{
  color?: string;
  size?: number;
}> = ({color, size = 28}) => {
  const style = useStyle();

  if (!color) {
    color = style.get('color-text-high').color;
  }

  return (
    <Svg width={size} height={size} fill="none" viewBox="0 0 28 28">
      <Path
        d="M18.375 23.25L9.625 14.5L18.375 5.75"
        stroke={color || 'currentColor'}
        strokeWidth="2.91667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
