import React, {FunctionComponent} from 'react';
import {View, ViewStyle} from 'react-native';

export type GutterDirection = 'both' | 'vertical' | 'horizontal';

export interface GutterProps {
  size: number;
  direction?: GutterDirection;
}

export const Gutter: FunctionComponent<GutterProps> = ({size, direction}) => {
  const styleSheet: ViewStyle = (() => {
    if (direction === 'vertical') {
      return {
        'min-height': size,
        height: size,
        width: 1,
        'min-width': 1,
      };
    }
    if (direction === 'horizontal') {
      return {
        'min-height': 1,
        height: 1,
        width: size,
        'min-width': size,
      };
    }

    return {
      'min-height': size,
      height: size,
      width: size,
      'min-width': size,
    };
  })();

  return <View style={styleSheet} />;
};
