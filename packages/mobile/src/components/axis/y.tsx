import React, {FunctionComponent, PropsWithChildren} from 'react';
import {YAxisProps} from './types';
import {useStyle} from '../../styles';
import {View} from 'react-native';

export const YAxis: FunctionComponent<PropsWithChildren<YAxisProps>> = ({
  children,
  alignX,
}) => {
  const style = useStyle();

  const alignItems = (() => {
    switch (alignX) {
      case 'left':
        return 'items-start';
      case 'right':
        return 'items-end';
      case 'center':
        return 'items-center';
      default:
    }
  })();

  return (
    <View
      style={style.flatten(
        ['flex-column'],
        [alignItems && (alignItems as any)],
      )}>
      {children}
    </View>
  );
};
