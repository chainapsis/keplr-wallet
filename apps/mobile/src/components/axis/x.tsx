import React, {FunctionComponent, PropsWithChildren} from 'react';
import {XAxisProps} from './types';
import {View} from 'react-native';
import {useStyle} from '../../styles';

export const XAxis: FunctionComponent<PropsWithChildren<XAxisProps>> = ({
  children,
  alignY,
}) => {
  const style = useStyle();

  const alignItems = (() => {
    switch (alignY) {
      case 'top':
        return 'items-start';
      case 'bottom':
        return 'items-end';
      case 'center':
        return 'items-center';
      default:
    }
  })();

  return (
    <View
      style={style.flatten(['flex-row'], [alignItems && (alignItems as any)])}>
      {children}
    </View>
  );
};
