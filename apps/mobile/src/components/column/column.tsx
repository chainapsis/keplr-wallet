import React, {FunctionComponent, PropsWithChildren} from 'react';
import {ColumnProps} from './types';
import {View} from 'react-native';

export const Column: FunctionComponent<PropsWithChildren<ColumnProps>> = ({
  children,
  weight,
}) => {
  if (weight < 0) {
    weight = 0;
  }

  return <View style={{flex: weight}}>{children}</View>;
};
