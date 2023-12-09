import React, {useState} from 'react';
import {CopyAddressScene} from './copy-address-scene';
import {QRScene} from './qr-scene';
import {registerCardModal} from '../../../../components/modal/card';
import {HorizontalSimpleScene} from '../../../../components/transition';
import {observer} from 'mobx-react-lite';
import {useStore} from '../../../../stores';

export const DepositModal = registerCardModal<{
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}>(
  observer(({isOpen, setIsOpen}) => {
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
        }}
      />
    );
  }),
);
