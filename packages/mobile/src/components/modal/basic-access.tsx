import React, {FunctionComponent, useMemo, useRef} from 'react';
import {observer} from 'mobx-react-lite';
import {useStore} from '../../stores';
import {useStyle} from '../../styles';
import {BaseModalHeader, Modal} from './modal';
import {BottomSheetModal, BottomSheetView} from '@gorhom/bottom-sheet';
import {useEffectOnce} from '../../hooks';
import {useIntl} from 'react-intl';
import {Text} from 'react-native';
import {XAxis} from '../axis';
import {Button} from '../button';
import {Gutter} from '../gutter';

export const BasicAccessModal: FunctionComponent = observer(() => {
  const intl = useIntl();
  const style = useStyle();
  const {permissionStore} = useStore();

  const modalRef = useRef<BottomSheetModal>(null);
  useEffectOnce(() => {
    modalRef.current?.present();
  });

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
    <Modal
      ref={modalRef}
      snapPoints={['50%']}
      enableDynamicSizing={true}
      onDismiss={async () => {
        await permissionStore.rejectPermissionAll();
      }}>
      <BottomSheetView style={style.flatten(['padding-12'])}>
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
      </BottomSheetView>
    </Modal>
  );
});
