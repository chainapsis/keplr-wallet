import React, {FunctionComponent, useState} from 'react';
import {AppState, Keyboard} from 'react-native';
import {useEffectOnce} from '../../hooks';
import {AutoLockUnlockModal} from './modal';
import {observer} from 'mobx-react-lite';
import {useStore} from '../../stores';

export const AutoLock: FunctionComponent = observer(() => {
  const {uiConfigStore, keyRingStore} = useStore();
  const [isLock, setIsLock] = useState(false);

  useEffectOnce(() => {
    AppState.addEventListener('change', e => {
      if (e === 'background' || e === 'inactive') {
        const isUnLocked = keyRingStore.status === 'unlocked';
        if (uiConfigStore.autoLockConfig.isEnableAutoLock && isUnLocked) {
          setIsLock(true);
          Keyboard.dismiss();
        }
      }
    });
  });

  return (
    <React.Fragment>
      {keyRingStore.status === 'unlocked' &&
      uiConfigStore.autoLockConfig.isEnableAutoLock ? (
        <AutoLockUnlockModal
          isOpen={isLock}
          setIsOpen={setIsLock}
          unlock={() => setIsLock(false)}
        />
      ) : null}
    </React.Fragment>
  );
});
