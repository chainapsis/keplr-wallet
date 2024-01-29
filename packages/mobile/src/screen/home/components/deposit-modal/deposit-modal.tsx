import React, {useState} from 'react';
import {CopyAddressScene} from './copy-address-scene';
import {QRScene} from './qr-scene';
import {registerCardModal} from '../../../../components/modal/card';
import {HorizontalSimpleScene} from '../../../../components/transition';
import {observer} from 'mobx-react-lite';
import {useStore} from '../../../../stores';
import {BuyModal} from './buy-modal';
import {StackNavProp} from '../../../../navigation';

export const DepositModal = registerCardModal<{
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;

  navigation: StackNavProp;
  disableBuyCrypto?: boolean;
}>(
  observer(({isOpen, setIsOpen, navigation, disableBuyCrypto}) => {
    const {chainStore} = useStore();

    const [qrChainId, setQRChainId] = useState<string>(
      () => chainStore.chainInfos[0].chainId,
    );
    const [qrBech32Address, setQRBech32Address] = useState<string>('');
    const [currentScene, setCurrentScene] = useState('List');

    return (
      <HorizontalSimpleScene
        scenes={[
          {
            key: 'List',
            element: CopyAddressScene,
          },
          {
            key: 'QR',
            element: QRScene,
          },
          {
            key: 'Buy',
            element: BuyModal,
          },
        ]}
        transitionAlign="bottom"
        currentSceneKey={currentScene}
        sharedProps={{
          isOpen,
          setIsOpen,
          currentScene,
          setCurrentScene,
          qrChainId,
          setQRChainId,
          qrBech32Address,
          setQRBech32Address,
          navigation,
          disableBuyCrypto,
        }}
      />
    );
  }),
  {
    disabledSafeArea: true,
  },
);
