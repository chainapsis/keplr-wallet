import React, {FunctionComponent} from 'react';
import {IconProps} from './types';
import {Path, Rect, Svg} from 'react-native-svg';

export const EthereumIcon: FunctionComponent<IconProps> = ({size}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 61 60" fill="none">
      <Rect
        x="7.09766"
        y="6.75"
        width="46.5"
        height="46.5"
        rx="11.7722"
        fill="#424247"
      />
      <Path
        d="M30.2569 25.8844V14.999L21.2344 29.9716L30.2569 25.8844Z"
        fill="#FCFCFC"
      />
      <Path
        d="M30.2569 35.4643L21.2344 29.973L30.2569 25.8857V35.4643Z"
        fill="#FCFCFC"
      />
      <Path
        d="M21.1758 32.1494L30.2422 44.9223V37.5059L21.1758 32.1494Z"
        fill="#FCFCFC"
      />
      <Path
        d="M30.1873 25.9043V14.999L39.1873 29.999L30.1873 25.9043Z"
        fill="#CFCFCF"
      />
      <Path
        d="M30.1791 35.4303L39.1877 29.9469L30.1791 25.8656V35.4303Z"
        fill="#CFCFCF"
      />
      <Path
        d="M39.1872 32.1278L30.123 44.8899V37.4797L39.1872 32.1278Z"
        fill="#CFCFCF"
      />
    </Svg>
  );
};
