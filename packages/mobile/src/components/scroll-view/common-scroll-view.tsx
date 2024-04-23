import React, {FunctionComponent} from 'react';
import {ScrollView as NativeScrollView, ScrollViewProps} from 'react-native';
import {ScrollView as ScrollViewGesture} from 'react-native-gesture-handler';

export const ScrollView: FunctionComponent<
  ScrollViewProps & {isGestureScrollView?: boolean}
> = props => {
  const {
    style: propStyle,
    indicatorStyle,
    isGestureScrollView,
    ...restProps
  } = props;

  const ContainerElement = isGestureScrollView
    ? ScrollViewGesture
    : NativeScrollView;

  return (
    <ContainerElement
      style={propStyle}
      {...restProps}
      indicatorStyle={indicatorStyle || 'white'}
    />
  );
};
