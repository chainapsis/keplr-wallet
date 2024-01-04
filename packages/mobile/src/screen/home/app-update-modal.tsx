import {observer} from 'mobx-react-lite';
import React from 'react';
import {Linking, Text} from 'react-native';
import {useStyle} from '../../styles';
import {Box} from '../../components/box';
import {Gutter} from '../../components/gutter';
import {Button} from '../../components/button';
import {registerCardModal} from '../../components/modal/card';
import {BaseModalHeader} from '../../components/modal';
import {useIntl} from 'react-intl';
import {useAppUpdate} from '../../provider/app-update';

export const AppUpdateModal = registerCardModal(
  observer<{
    setIsOpen: (isOpen: boolean) => void;
  }>(({setIsOpen}) => {
    const style = useStyle();
    const intl = useIntl();

    const appUpdate = useAppUpdate();

    const isStoreUpdate = (() => {
      if (appUpdate.store.newVersionAvailable) {
        return true;
      }

      return false;
    })();

    return (
      <Box paddingX={12} paddingBottom={24}>
        <BaseModalHeader
          title={
            isStoreUpdate
              ? intl.formatMessage({
                  id: 'page.main.components.app-update-modal.title',
                })
              : '😎 Keplr Just Got Better'
          }
        />
        <Gutter size={28} />

        <Text
          style={style.flatten([
            'body3',
            'color-text-low',
            'text-center',
            'padding-x-14',
          ])}>
          {isStoreUpdate
            ? intl.formatMessage({
                id: 'page.main.components.app-update-modal.paragraph',
              })
            : "We've downloaded some minor updates while you're gone. To apply these changes, kindly quit and reopen Keplr."}
        </Text>
        <Gutter size={28} />

        <Button
          size="large"
          text={
            isStoreUpdate
              ? intl.formatMessage({
                  id: 'page.main.components.app-update-modal.button',
                })
              : 'Quit Keplr'
          }
          onPress={() => {
            if (isStoreUpdate) {
              if (appUpdate.store.updateURL) {
                Linking.openURL(appUpdate.store.updateURL);
              }
            } else {
              appUpdate.restartApp();
            }
            setIsOpen(false);
          }}
        />
      </Box>
    );
  }),
);
