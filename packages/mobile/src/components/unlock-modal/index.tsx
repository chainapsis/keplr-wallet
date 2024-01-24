import React, {FunctionComponent, useState} from 'react';
import {AppState, Keyboard, Platform} from 'react-native';
import {useEffectOnce} from '../../hooks';
import {AutoLockUnlockModal} from './modal';
import {observer} from 'mobx-react-lite';
import {useStore} from '../../stores';

export interface AutoLockState {
  isLocked: boolean;
  isUnlockPage?: boolean;
  unlock: () => void;
  setIsUnlockPage: (is: boolean) => void;
}

export const AutoLock: FunctionComponent = observer(() => {
  const {uiConfigStore, keyRingStore} = useStore();
  const [isLock, setIsLock] = useState(false);

  useEffectOnce(() => {
    //NOTE 안드로이드의 경우 앱을 뒤로보낼경우 blur이고 뒤로가기 해서 앱이 꺼지는것 처럼 되면 state가 background 됨
    //헤서 안드로이는 blur에서 ios은 change 이벤트에서 처리함

    if (Platform.OS === 'android') {
      AppState.addEventListener('blur', () => {
        const isUnLocked = keyRingStore.status === 'unlocked';
        if (uiConfigStore.autoLockConfig.isEnableAutoLock && isUnLocked) {
          setIsLock(true);
          Keyboard.dismiss();
        }
      });
    } else {
      AppState.addEventListener('change', e => {
        if (e === 'background') {
          const isUnLocked = keyRingStore.status === 'unlocked';
          if (uiConfigStore.autoLockConfig.isEnableAutoLock && isUnLocked) {
            setIsLock(true);
            Keyboard.dismiss();
          }
        }
      });
    }
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
