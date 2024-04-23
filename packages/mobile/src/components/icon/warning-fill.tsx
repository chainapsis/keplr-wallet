import React, {FunctionComponent} from 'react';
import {IconProps} from './types';
import {Path, Svg} from 'react-native-svg';

export const WarningFillIcon: FunctionComponent<IconProps> = ({
  size,
  color,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 76 76" fill="none">
      <Path
        d="M29.7709 9.51045C33.4268 3.1736 42.5725 3.1736 46.2284 9.51045L69.5171 49.8775C73.171 56.2109 68.6001 64.1249 61.2884 64.1249H14.7109C7.39919 64.1249 2.82833 56.2109 6.48218 49.8775L29.7709 9.51045ZM38.0003 26.1247C39.312 26.1247 40.3753 27.188 40.3753 28.4997V40.3747C40.3753 41.6864 39.312 42.7497 38.0003 42.7497C36.6886 42.7497 35.6253 41.6864 35.6253 40.3747V28.4997C35.6253 27.188 36.6886 26.1247 38.0003 26.1247ZM38.0003 52.2497C39.312 52.2497 40.3753 51.1864 40.3753 49.8747C40.3753 48.563 39.312 47.4997 38.0003 47.4997C36.6886 47.4997 35.6253 48.563 35.6253 49.8747C35.6253 51.1864 36.6886 52.2497 38.0003 52.2497Z"
        fill={color || 'currentColor'}
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </Svg>
  );
};
