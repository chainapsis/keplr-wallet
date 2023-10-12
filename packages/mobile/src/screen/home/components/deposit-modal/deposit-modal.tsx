import React from 'react';
import {BaseModal} from '../../../../components/modal/modal';
import {CopyAddressScene} from './copy-address-scene';
import {QRScene} from './qr-scene';

interface QRSeneProps {
  chainId: string;
  chainName: string;
  bech32Address: string;
}
export type DepositModalNav = {
  List: undefined;
  QR: QRSeneProps;
};

export const DepositModal = () => {
  return (
    <BaseModal
      initialRouteName="List"
      screenList={[
        {routeName: 'List', scene: CopyAddressScene},
        {
          routeName: 'QR',
          scene: QRScene,
        },
      ]}
    />
  );
};
