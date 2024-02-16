import {registerCardModal} from './card';
import React from 'react';
import {Box} from '../box';
import {BaseModalHeader} from './modal';
import {FormattedMessage, useIntl} from 'react-intl';
import {Gutter} from '../gutter';
import {Chip} from '../chip';
import {useStyle} from '../../styles';
import {Text} from 'react-native';
import {Button} from '../button';
import * as WebBrowser from 'expo-web-browser';
import {APP_VERSION, CODEPUSH_VERSION} from '../../../constants';

export const NeedHelpModal = registerCardModal(() => {
  const intl = useIntl();
  const style = useStyle();
  return (
    <Box paddingX={12} alignX="center">
      <BaseModalHeader
        title={intl.formatMessage({
          id: 'page.unlock.need-help-button',
        })}
      />

      <Gutter size={12} />

      <Chip
        text={`Keplr version: ${CODEPUSH_VERSION || APP_VERSION}`}
        textStyle={{color: style.get('color-text-high').color}}
        backgroundStyle={style.flatten(['padding-x-12', 'padding-y-6'])}
      />

      <Gutter size={24} />

      <Text
        style={style.flatten([
          'body2',
          'color-text-low',
          'padding-x-16',
          'text-center',
        ])}>
        <FormattedMessage id="page.unlock.need-help.paragraph" />
      </Text>

      <Gutter size={32} />

      <Button
        text={intl.formatMessage({
          id: 'page.unlock.need-help.go-to-helpdesk-button',
        })}
        size="large"
        color="secondary"
        containerStyle={{width: '100%'}}
        onPress={() => {
          WebBrowser.openBrowserAsync('https://help.keplr.app/');
        }}
      />

      <Gutter size={20} />
    </Box>
  );
});
