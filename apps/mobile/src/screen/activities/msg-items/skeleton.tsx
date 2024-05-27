import React, {FunctionComponent} from 'react';
import {Box} from '../../../components/box';
import {useStyle} from '../../../styles';
import {XAxis, YAxis} from '../../../components/axis';
import {Gutter} from '../../../components/gutter';

export const MsgItemSkeleton: FunctionComponent = () => {
  const style = useStyle();

  return (
    <Box
      borderRadius={6}
      padding={16}
      backgroundColor={style.get('color-card-default').color}>
      <XAxis alignY="center">
        <Box
          width={32}
          height={32}
          borderRadius={99999}
          backgroundColor={style.get('color-gray-550').color}
        />

        <Gutter size={12} />

        <YAxis alignX="left">
          <Box
            width={52}
            height={12}
            backgroundColor={style.get('color-gray-550').color}
          />

          <Gutter size={10} />

          <Box
            width={72}
            height={12}
            backgroundColor={style.get('color-gray-550').color}
          />
        </YAxis>

        <Box style={{flex: 1}} />

        <YAxis alignX="right">
          <Box
            width={52}
            height={12}
            backgroundColor={style.get('color-gray-550').color}
          />

          <Gutter size={10} />

          <Box
            width={72}
            height={12}
            backgroundColor={style.get('color-gray-550').color}
          />
        </YAxis>
      </XAxis>
    </Box>
  );
};
