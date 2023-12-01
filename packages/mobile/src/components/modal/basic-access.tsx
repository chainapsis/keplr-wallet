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

export const BasicAccessModal = registerCardModal(
  observer<{
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
  }>(() => {
    const intl = useIntl();
    const style = useStyle();
    const {permissionStore} = useStore();

    const waitingPermission =
      permissionStore.waitingPermissionDatas.length > 0
        ? permissionStore.waitingPermissionDatas[0]
        : undefined;

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

    const chainIds = useMemo(() => {
      if (!waitingPermission) {
        return '';
      }

      return waitingPermission.data.chainIds.join(', ');
    }, [waitingPermission]);

    return (
      <Box paddingX={12} paddingBottom={12}>
        <BaseModalHeader
          title={intl.formatMessage({
            id: 'page.permission.requesting-connection-title',
          })}
        />

        <Text
          style={style.flatten([
            'body2',
            'color-text-middle',
          ])}>{`${host} is requesting to connect to your Keplr account on ${chainIds}`}</Text>

        <XAxis>
          <Button
            size="large"
            text="Reject"
            color="secondary"
            containerStyle={{flex: 1, width: '100%'}}
            onPress={async () => {
              await permissionStore.rejectPermissionAll();
            }}
          />

          <Gutter size={16} />

          <Button
            size="large"
            text="Approve"
            containerStyle={{flex: 1, width: '100%'}}
            onPress={async () => {
              if (waitingPermission) {
                await permissionStore.approvePermissionWithProceedNext(
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
