import {observer} from 'mobx-react-lite';
import React, {FunctionComponent, useEffect, useState} from 'react';
import {Linking, Text} from 'react-native';
import {useStyle} from '../../styles';
import {Box} from '../../components/box';
import {Gutter} from '../../components/gutter';
import {Button} from '../../components/button';
import {registerCardModal} from '../../components/modal/card';
import {BaseModalHeader} from '../../components/modal';
import {FormattedMessage, useIntl} from 'react-intl';
import {useAppUpdate} from '../../provider/app-update';
import {VerticalCollapseTransition} from '../../components/transition';
import {TouchableHighlight} from 'react-native-gesture-handler';
import {XAxis} from '../../components/axis';
import Svg, {Path} from 'react-native-svg';

export const AppUpdateTopLabel: FunctionComponent<{
  isNotReady: boolean;
}> = ({isNotReady}) => {
  const style = useStyle();

  const appUpdate = useAppUpdate();
  const [newVersionExist, setNewVersionExist] = useState(false);
  const [isOpenAppUpdateModal, setIsOpenAppUpdateModal] = useState(false);

  useEffect(() => {
    if (appUpdate.store.newVersionAvailable) {
      setNewVersionExist(true);
      return;
    }
    if (
      appUpdate.codepush.newVersion &&
      appUpdate.codepush.newVersionDownloadProgress === 1
    ) {
      setNewVersionExist(true);
      return;
    }
    setNewVersionExist(false);
  }, [
    appUpdate.codepush.newVersion,
    appUpdate.codepush.newVersionDownloadProgress,
    appUpdate.store.newVersionAvailable,
  ]);

  return (
    <React.Fragment>
      <VerticalCollapseTransition
        collapsed={(() => {
          if (isNotReady) {
            return true;
          }

          return !newVersionExist;
        })()}>
        <TouchableHighlight
          onPress={() => {
            setIsOpenAppUpdateModal(true);
          }}>
          <Box
            style={{
              ...style.flatten(['height-38']),
              // TODO: 나중에 이 색상을 style builder 밑에 넣자...
              backgroundColor: '#1A2646',
            }}
            alignX="center"
            alignY="center">
            <XAxis alignY="center">
              <Text
                style={{
                  ...style.flatten(['text-caption2', 'text-underline']),
                  // TODO: 나중에 이 색상을 style builder 밑에 넣자...
                  color: '#AABBF9',
                }}>
                <FormattedMessage id="page.main.components.app-update-modal.banner-title" />
              </Text>
              <Gutter size={3.5} />
              <Svg width="12" height="12" fill="none" viewBox="0 0 12 12">
                <Path
                  stroke="#AABBF9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.25"
                  d="M2.25 6h7.5m0 0L6.375 2.625M9.75 6L6.375 9.375"
                />
              </Svg>
            </XAxis>
          </Box>
        </TouchableHighlight>

        <Gutter size={12} />
      </VerticalCollapseTransition>
      <AppUpdateModal
        isOpen={isOpenAppUpdateModal}
        setIsOpen={setIsOpenAppUpdateModal}
      />
    </React.Fragment>
  );
};

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
              : intl.formatMessage({
                  id: 'page.main.components.code-push-update-modal.title',
                })
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
            : intl.formatMessage({
                id: 'page.main.components.code-push-update-modal.paragraph',
              })}
        </Text>
        <Gutter size={28} />

        <Button
          size="large"
          text={
            isStoreUpdate
              ? intl.formatMessage({
                  id: 'page.main.components.app-update-modal.button',
                })
              : intl.formatMessage({
                  id: 'page.main.components.code-push-update-modal.button',
                })
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
