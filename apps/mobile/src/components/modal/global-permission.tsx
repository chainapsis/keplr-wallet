import React, {useMemo} from 'react';
import {observer} from 'mobx-react-lite';
import {useStore} from '../../stores';
import {useStyle} from '../../styles';
import {BaseModalHeader} from './modal';
import {useIntl} from 'react-intl';
import {Text} from 'react-native';
import {XAxis} from '../axis';
import {Button} from '../button';
import {Gutter} from '../gutter';
import {Box} from '../box';
import {registerCardModal} from './card';
import * as ExpoImage from 'expo-image';
import {GuideBox} from '../guide-box';

export const GlobalPermissionModal = registerCardModal(
  observer<{
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
  }>(() => {
    const intl = useIntl();
    const style = useStyle();
    const {permissionStore} = useStore();

    const waitingPermission = permissionStore.waitingGlobalPermissionData;

    const host = useMemo(() => {
      if (waitingPermission) {
        return waitingPermission.data.origins
          .map(origin => {
            return new URL(origin).host;
          })
          .join(', ');
      } else {
        return '';
      }
    }, [waitingPermission]);

    return (
      <Box paddingX={12} paddingBottom={12} alignX="center">
        <BaseModalHeader
          title={intl.formatMessage({
            id: 'page.permission.requesting-connection-title',
          })}
        />

        <Gutter size={16} />

        <ExpoImage.Image
          style={{width: 74, height: 74}}
          source={require('../../public/assets/logo-256.png')}
          contentFit="contain"
        />

        <Gutter size={16} />

        <Text style={style.flatten(['body2', 'color-text-middle'])}>
          {host}
        </Text>

        <Gutter size={16} />

        <Box width="100%">
          <GuideBox
            title={intl.formatMessage({id: 'page.permission.guide-title'})}
            paragraph={intl.formatMessage({
              id: 'page.permission.guide-paragraph',
            })}
          />
        </Box>

        <Gutter size={16} />

        <XAxis>
          <Button
            size="large"
            text="Reject"
            color="secondary"
            containerStyle={{flex: 1, width: '100%'}}
            onPress={async () => {
              if (waitingPermission) {
                await permissionStore.rejectGlobalPermissionAll();
              }
            }}
          />

          <Gutter size={16} />

          <Button
            size="large"
            text="Approve"
            containerStyle={{flex: 1, width: '100%'}}
            onPress={async () => {
              if (waitingPermission) {
                await permissionStore.approveGlobalPermissionWithProceedNext(
                  waitingPermission.id,
                  () => {},
                );
              }
            }}
          />
        </XAxis>
      </Box>
    );
  }),
);
