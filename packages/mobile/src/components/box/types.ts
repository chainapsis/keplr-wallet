import {MouseEventHandler} from 'react';
import {AnimatableNumericValue, DimensionValue, ViewStyle} from 'react-native';

export type BoxAlignX = 'left' | 'right' | 'center';
export type BoxAlignY = 'top' | 'bottom' | 'center';

export interface BoxProps {
  position?: 'relative' | 'absolute';
  width?: DimensionValue;
  minWidth?: DimensionValue;
  maxWidth?: DimensionValue;
  height?: DimensionValue;
  minHeight?: DimensionValue;
  maxHeight?: DimensionValue;
  color?: string;
  backgroundColor?: string;
  borderRadius?: AnimatableNumericValue;
  borderWidth?: string;
  borderColor?: string;
  padding?: DimensionValue;
  paddingX?: DimensionValue;
  paddingY?: DimensionValue;
  paddingTop?: DimensionValue;
  paddingBottom?: DimensionValue;
  paddingLeft?: DimensionValue;
  paddingRight?: DimensionValue;
  margin?: DimensionValue;
  marginX?: DimensionValue;
  marginY?: DimensionValue;
  marginTop?: DimensionValue;
  marginBottom?: DimensionValue;
  marginLeft?: DimensionValue;
  marginRight?: DimensionValue;

  zIndex?: number;

  alignX?: BoxAlignX;
  alignY?: BoxAlignY;

  cursor?: 'pointer' | 'not-allowed' | 'progress';

  style?: ViewStyle;

  onClick?: MouseEventHandler<HTMLDivElement>;
}
