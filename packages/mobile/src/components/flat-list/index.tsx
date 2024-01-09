import React from 'react';
import {FlatList as NativeFlatList, FlatListProps} from 'react-native';
import {FlatList as FlatListGesture} from 'react-native-gesture-handler';

export const FlatList = <ItemT extends any>(
  props: FlatListProps<ItemT> & {isGestureFlatList?: boolean},
) => {
  const {
    style: propStyle,
    indicatorStyle,
    isGestureFlatList,
    ...restProps
  } = props;
  const ContainerElement = isGestureFlatList ? FlatListGesture : NativeFlatList;

  return (
    <ContainerElement
      style={propStyle}
      {...restProps}
      indicatorStyle={indicatorStyle || 'white'}
    />
  );
};
