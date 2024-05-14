import {registerCardModal} from './card';
import React from 'react';
import {Box} from '../box';
import {useIntl} from 'react-intl';
import {Gutter} from '../gutter';
import {useStyle} from '../../styles';
import {Text} from 'react-native';

export const GoBackToBrowserModal = registerCardModal(() => {
  const intl = useIntl();
  const style = useStyle();
  return (
    <Box alignX="center">
      <Gutter size={36} />

      <Text style={style.flatten(['h1', 'color-text-high'])}>
        {intl.formatMessage({
          id: 'modal.walletconnect.go-back-to-browser-title',
        })}
      </Text>
      <Gutter size={12} />
      <Text style={style.flatten(['body1', 'color-text-low'])}>
        {intl.formatMessage({
          id: 'modal.walletconnect.go-back-to-browser-paragraph',
        })}
      </Text>

      <Gutter size={36} />
    </Box>
  );
});
