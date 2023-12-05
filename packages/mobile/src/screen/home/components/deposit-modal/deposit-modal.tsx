import React, {useState} from 'react';
import {CopyAddressScene} from './copy-address-scene';
import {QRScene} from './qr-scene';
import {registerCardModal} from '../../../../components/modal/card';
import {HorizontalSimpleScene} from '../../../../components/transition';

export const DepositModal = registerCardModal<{
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}>(({isOpen, setIsOpen}) => {
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
      }}
    />
  );
});
