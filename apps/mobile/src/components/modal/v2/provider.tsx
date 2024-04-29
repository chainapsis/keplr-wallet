import React, {FunctionComponent, PropsWithChildren} from 'react';
import {observer} from 'mobx-react-lite';
import {globalModalStates} from './state';
import {ModalRoot} from './render';
import {SharedValue} from 'react-native-reanimated';

export interface ModalBase {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;

  closeModalWithTransitionDelegate: () => void;

  isClosing: boolean;

  // 모달이 열리거나 닫히는 애니메이션 중인지 여부
  duringModalTransition: SharedValue<'not' | 'open' | 'close'>;
  translateY: SharedValue<number | null>;
  layoutHeightShared: SharedValue<number | null>;

  detachModal: () => void;
}

export const ModalBaseContext = React.createContext<ModalBase | null>(null);

export const ModalBaseProvider: FunctionComponent<PropsWithChildren> = observer(
  ({children}) => {
    return (
      <React.Fragment>
        {children}
        {globalModalStates.modals.length > 0 ? (
          <ModalRoot modalStates={globalModalStates} />
        ) : null}
      </React.Fragment>
    );
  },
);

export const useModalBase = () => {
  const context = React.useContext(ModalBaseContext);
  if (context === null) {
    throw new Error('You are not under modal component');
  }
  return context;
};
