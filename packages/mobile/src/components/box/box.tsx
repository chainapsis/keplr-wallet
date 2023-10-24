import React, {FunctionComponent, PropsWithChildren} from 'react';
import {BoxProps} from './types';
import {Pressable, StyleSheet, View, ViewStyle} from 'react-native';

export const Box: FunctionComponent<PropsWithChildren<BoxProps>> = props => {
  if (props.onClick) {
    return (
      <Pressable onPress={props.onClick}>
        <BoxInner {...props} />
      </Pressable>
    );
  }

  return <BoxInner {...props} />;
};

const BoxInner: FunctionComponent<PropsWithChildren<BoxProps>> = ({
  children,
  style,
  alignX,
  alignY,
  width,
  minWidth,
  maxWidth,
  height,
  minHeight,
  maxHeight,
  backgroundColor,
  borderRadius,
  borderWidth,
  borderColor,
  margin,
  marginBottom,
  marginLeft,
  marginRight,
  marginTop,
  marginX,
  marginY,
  padding,
  paddingBottom,
  paddingLeft,
  paddingRight,
  paddingTop,
  paddingX,
  paddingY,
  position,
  zIndex,
}) => {
  const boxStyle: ViewStyle = {
    display: 'flex',
    flexDirection: 'column',
    position,
    width,
    minWidth,
    maxWidth,
    height,
    minHeight,
    maxHeight,

    backgroundColor,

    borderRadius,
    borderColor,
    borderStyle: borderWidth ? 'solid' : undefined,
    borderWidth: borderWidth,

    padding,
    paddingTop: paddingTop || paddingY,
    paddingBottom: paddingBottom || paddingY,
    paddingLeft: paddingLeft || paddingX,
    paddingRight: paddingRight || paddingX,
    margin,
    marginTop: marginTop || marginY,
    marginBottom: marginBottom || marginY,
    marginLeft: marginLeft || marginX,
    marginRight: marginRight || marginX,

    zIndex,

    alignItems: (() => {
      if (alignX === 'left') {
        return 'flex-start';
      }
      if (alignX === 'center') {
        return 'center';
      }
      if (alignX === 'right') {
        return 'flex-end';
      }
    })(),
    justifyContent: (() => {
      if (alignY === 'top') {
        return 'flex-start';
      }
      if (alignY === 'center') {
        return 'center';
      }
      if (alignY === 'bottom') {
        return 'flex-end';
      }
    })(),
  };

  return <View style={StyleSheet.flatten([boxStyle, style])}>{children}</View>;
};
