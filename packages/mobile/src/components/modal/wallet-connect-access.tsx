import React, {useLayoutEffect, useMemo, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {useStore} from '../../stores';
import {useStyle} from '../../styles';
import {BaseModalHeader} from './modal';
import {FormattedMessage, useIntl} from 'react-intl';
import {Text} from 'react-native';
import {XAxis} from '../axis';
import {Button} from '../button';
import {Gutter} from '../gutter';
import {PermissionData} from '@keplr-wallet/background';
import {WCMessageRequester} from '../../stores/wallet-connect/msg-requester';
import * as ExpoImage from 'expo-image';
import {Box} from '../box';
import {registerCardModal} from './card';

export const WalletConnectAccessModal = registerCardModal(
  observer<{
    data: {
      ids: string[];
    } & PermissionData;

    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
  }>(({data}) => {
    const intl = useIntl();
    const style = useStyle();
    const {permissionStore, walletConnectStore} = useStore();

    const [peerMeta, setPeerMeta] = useState<
      {name?: string; url?: string; icons?: string[]} | undefined
    >(undefined);

    useLayoutEffect(() => {
      if (data.origins.length !== 1) {
        throw new Error('Invalid origins');
      }

      walletConnectStore
        .getSessionMetadata(
          WCMessageRequester.getIdFromVirtualURL(data.origins[0]),
        )
        .then(r => setPeerMeta(r));
    }, [data.origins, walletConnectStore]);

    const appName = peerMeta?.name || peerMeta?.url || 'unknown';
    const chainIds = useMemo(() => {
      return data.chainIds.join(', ');
    }, [data]);

    const logoUrl = useMemo(() => {
      if (peerMeta?.icons && peerMeta.icons.length > 0) {
        return peerMeta.icons[peerMeta.icons.length - 1];
      }
    }, [peerMeta?.icons]);

    return (
      <Box paddingX={12} paddingBottom={12}>
        <BaseModalHeader
          title={intl.formatMessage({
            id: 'page.permission.requesting-connection-title',
          })}
        />

        <Gutter size={32} />

        <Box alignX="center">
          <ExpoImage.Image
            style={{width: 74, height: 75}}
            source={logoUrl}
            contentFit="contain"
          />
        </Box>

        <Gutter size={16} />

        <Text
          style={style.flatten(['body2', 'color-text-middle', 'text-center'])}>
          <FormattedMessage
            id="wallet-connect.information-text"
            values={{
              appName,
              chainIds,
            }}
          />
        </Text>

        <Gutter size={16} />

        <XAxis>
          <Button
            size="large"
            text={intl.formatMessage({id: 'button.reject'})}
            color="secondary"
            containerStyle={{flex: 1, width: '100%'}}
            onPress={async () => {
              await permissionStore.rejectPermissionWithProceedNext(
                data.ids,
                () => {},
              );
            }}
          />

          <Gutter size={16} />

          <Button
            size="large"
            text={intl.formatMessage({id: 'button.approve'})}
            containerStyle={{flex: 1, width: '100%'}}
            onPress={async () => {
              await permissionStore.approvePermissionWithProceedNext(
                data.ids,
                () => {},
              );
            }}
          />
        </XAxis>
      </Box>
    );
  }),
);
