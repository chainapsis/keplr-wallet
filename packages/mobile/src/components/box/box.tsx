import React, {FunctionComponent, PropsWithChildren} from 'react';
import {BoxProps} from './types';
import {StyleSheet, View, ViewStyle} from 'react-native';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';

export const Box: FunctionComponent<PropsWithChildren<BoxProps>> = ({
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
  onClick,
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

  if (onClick) {
    // TODO: react-native-gesture-handler의 TouchableWithoutFeedback는 style이 View랑 다른 것 같다.
    //      TouchableWithoutFeedback 자체가 View 하나로만 감싸지는게 아닌듯...
    //      스타일링의 차이로 인해서 여기서 처리할 수가 없다.
    //      Box 컴포넌트에서 onPress를 제거하고 각 view에서 알아서 TouchableWithoutFeedback를 사용해서 처리해야한다.
    return (
      <TouchableWithoutFeedback
        onPress={onClick}
        style={StyleSheet.flatten([boxStyle, style])}>
        {children}
      </TouchableWithoutFeedback>
    );
  }

  return <View style={StyleSheet.flatten([boxStyle, style])}>{children}</View>;
};
