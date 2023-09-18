import React, {FunctionComponent, PropsWithChildren} from 'react';
import {useStyle} from '../../styles';
import {Box} from '../box';
import {DimensionValue} from 'react-native';

export interface SkeletonProps {
  isNotReady?: boolean;
  type?: 'default' | 'button' | 'copyAddress' | 'circle';
  dummyMinWidth?: DimensionValue;
  // This is for the case that the skeleton's background color.
  layer?: 0 | 1;

  horizontalBleed?: DimensionValue;
  verticalBleed?: DimensionValue;
}

export const Skeleton: FunctionComponent<PropsWithChildren<SkeletonProps>> = ({
  isNotReady,
  type = 'default',
  layer = 0,
  dummyMinWidth,
  horizontalBleed,
  verticalBleed,
  children,
}) => {
  const style = useStyle();

  const getBorderRadius = () => {
    switch (type) {
      case 'button':
        return 6;
      // case 'copyAddress':
      //   return CopyAddressRadius;
      case 'circle':
        return 999999;
      default:
        return 256;
    }
  };

  return (
    <Box position="relative" minWidth={isNotReady ? dummyMinWidth : undefined}>
      {isNotReady ? (
        <Box
          position="absolute"
          backgroundColor={
            layer === 0
              ? style.get('color-gray-600').color
              : style.get('color-gray-500').color
          }
          zIndex={10}
          borderRadius={getBorderRadius()}
          style={{
            top: verticalBleed || 0 * -1,
            bottom: verticalBleed || 0 * -1,
            left: horizontalBleed || 0 * -1,
            right: horizontalBleed || 0 * -1,
          }}
        />
      ) : null}

      {children}
    </Box>
  );
};
