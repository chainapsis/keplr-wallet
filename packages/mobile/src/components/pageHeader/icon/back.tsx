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
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15.75 19.5L8.25 12L15.75 4.5"
        stroke={color || 'currentColor'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
