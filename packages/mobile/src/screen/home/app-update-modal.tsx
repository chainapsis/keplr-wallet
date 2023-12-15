import {observer} from 'mobx-react-lite';
import React from 'react';
import {Linking, Text} from 'react-native';
import {useStyle} from '../../styles';
import {Box} from '../../components/box';
import {Gutter} from '../../components/gutter';
import {Button} from '../../components/button';
import {registerCardModal} from '../../components/modal/card';
import {BaseModalHeader} from '../../components/modal';
import {FormattedMessage, useIntl} from 'react-intl';

export const AppUpdateModal = registerCardModal(
  observer<{
    setIsOpen: (isOpen: boolean) => void;
    url: string;
  }>(({setIsOpen, url}) => {
    const style = useStyle();
    const intl = useIntl();
    return (
      <Box paddingX={12} paddingBottom={12}>
        <BaseModalHeader
          title={intl.formatMessage({
            id: 'page.main.components.app-update-modal.title',
          })}
        />
        <Gutter size={28} />

        <Text
          style={style.flatten([
            'body3',
            'color-text-low',
            'text-center',
            'padding-x-14',
          ])}>
          <FormattedMessage id="page.main.components.app-update-modal.paragraph" />
        </Text>
        <Gutter size={28} />

        <Button
          size="large"
          text={intl.formatMessage({
            id: 'page.main.components.app-update-modal.button',
          })}
          onPress={() => {
            Linking.openURL(url);
            setIsOpen(false);
          }}
        />
      </Box>
    );
  }),
);
