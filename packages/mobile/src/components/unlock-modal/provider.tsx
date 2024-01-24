import React, {FunctionComponent, PropsWithChildren, useState} from 'react';
import {AppState, Keyboard, Platform} from 'react-native';
import {useEffectOnce} from '../../hooks';
import {AutoLockUnlockModal} from '.';
import {observer} from 'mobx-react-lite';
import {useStore} from '../../stores';

export interface AutoLockState {
  isLocked: boolean;
  isUnlockPage?: boolean;
  unlock: () => void;
  setIsUnlockPage: (is: boolean) => void;
}

export const AutoLockContext = React.createContext<AutoLockState | null>(null);

export const useAutoLock = () => {
  const context = React.useContext(AutoLockContext);
  if (context === null) {
    throw new Error('You are not under auto unlock context');
  }
  return context;
};

export const AutoLockProvider: FunctionComponent<PropsWithChildren> = observer(
  ({children}) => {
    const {uiConfigStore} = useStore();
    const [isLock, setIsLock] = useState(false);
    const [isUnlockPage, setIsUnlockPage] = useState(false);
    useEffectOnce(() => {
      //NOTE 안드로이드의 경우 앱을 뒤로보낼경우 blur이고 뒤로가기 해서 앱이 꺼지는것 처럼 되면 state가 background 됨
      //헤서 안드로이는 blur에서 ios은 change 이벤트에서 처리함
      if (Platform.OS === 'android') {
        AppState.addEventListener('blur', () => {
          if (uiConfigStore.autoLockConfig.isEnableAutoLock) {
            setIsLock(true);
            Keyboard.dismiss();
          }
        });
      } else {
        AppState.addEventListener('change', e => {
          if (e === 'background') {
            if (uiConfigStore.autoLockConfig.isEnableAutoLock) {
              setIsLock(true);
              Keyboard.dismiss();
            }
          }
        });
      }
    });

    const unlock = () => {
      setIsLock(false);
    };

    return (
      <AutoLockContext.Provider
        value={{
          unlock,
          isLocked: isLock,
          isUnlockPage,
          setIsUnlockPage: isUnlockPage => {
            setIsUnlockPage(isUnlockPage);
          },
        }}>
        <React.Fragment>
          {children}
          {!isUnlockPage && uiConfigStore.autoLockConfig.isEnableAutoLock ? (
            <AutoLockUnlockModal isOpen={isLock} setIsOpen={setIsLock} />
          ) : null}
        </React.Fragment>
      </AutoLockContext.Provider>
    );
  },
);
