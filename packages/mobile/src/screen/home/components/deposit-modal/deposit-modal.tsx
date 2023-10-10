import React from 'react';

import {BaseModal} from '../../../../components/modal/modal';
import {CopyAddressScene} from './copy-address-scene';
import {QRScene} from './qr-scene';
import {RouteProp} from '@react-navigation/native';

interface QRSeneProps {
  chainId: string;
  chainName: string;
  bech32Address: string;
}
export type DepositModalNav = {
  List: undefined;
  QR: QRSeneProps;
};

const CopyAddressSceneFunc = () => <CopyAddressScene />;
const QRSceneFunc = (route: RouteProp<DepositModalNav, 'QR'>) => (
  <QRScene route={route} />
);

export const DepositModal = () => {
  return (
    <BaseModal
      screenOptions={{
        title: '',
        headerBackTitle: '',
      }}
      initialRouteName="List"
      screenList={[
        {routeName: 'List', scene: CopyAddressSceneFunc},
        {
          routeName: 'QR',
          scene: QRSceneFunc,
        },
      ]}
    />
  );
};
