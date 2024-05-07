import React, {FunctionComponent, PropsWithChildren} from 'react';
import {YAxisProps} from './types';
import {useStyle} from '../../styles';
import {Box} from '../box';

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
    <Box style={style.flatten([], [alignItems && (alignItems as any)])}>
      {children}
    </Box>
  );
};
