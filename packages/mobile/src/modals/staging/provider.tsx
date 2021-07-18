import React, { FunctionComponent, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Modal as ReactModal } from "react-native";
import { action, observable } from "mobx";
import { observer } from "mobx-react-lite";
import { ModalBase } from "./base";
import { ModalContext } from "./hooks";

export interface ModalOptions {
  readonly align: "top" | "center" | "bottom";
  readonly transitionDuration?: number;
  readonly openTransitionDuration?: number;
  readonly closeTransitionDuration?: number;
}

export interface Modal {
  readonly key: string;
  readonly element: React.ElementType;
  props: any;
  options: ModalOptions;
}

export class ModalsRendererState {
  @observable
  protected _modals: Modal[] = [];

  protected static lastKey: number = 0;

  protected static getKey(): string {
    ModalsRendererState.lastKey++;
    return ModalsRendererState.lastKey.toString();
  }

  get modals(): Modal[] {
    return this._modals;
  }

  @action
  pushModal<P>(
    modal: React.ElementType<P>,
    props: P,
    options: ModalOptions = {
      align: "bottom",
    }
  ) {
    this._modals.push({
      key: ModalsRendererState.getKey(),
      element: modal,
      props,
      options,
    });
  }

  @action
  updateModal(key: string, props: any) {
    const modal = this._modals.find((modal) => modal.key === key);
    if (modal) {
      modal.props = props;
    }
  }

  @action
  removeModal(key: string) {
    const i = this._modals.findIndex((modal) => modal.key === key);
    if (i >= 0) {
      this._modals.splice(i, 1);
    }
  }
}

export const globalModalRendererState = new ModalsRendererState();

export const ModalsProvider: FunctionComponent = observer(({ children }) => {
  return (
    <React.Fragment>
      {children}
      {globalModalRendererState.modals.length > 0 ? (
        <ReactModal transparent={true}>
          <SafeAreaProvider>
            {globalModalRendererState.modals.map((modal) => {
              return <ModalRenderer key={modal.key} modal={modal} />;
            })}
          </SafeAreaProvider>
        </ReactModal>
      ) : null}
    </React.Fragment>
  );
});

export const ModalRenderer: FunctionComponent<{
  modal: Modal;
}> = ({ modal }) => {
  const [isOpen, setIsOpen] = useState(true);

  const close = () => setIsOpen(false);

  return (
    <ModalContext.Provider
      value={{
        key: modal.key,
        close,
      }}
    >
      <ModalBase
        align={modal.options.align}
        isOpen={isOpen}
        close={close}
        onCloseTransitionEnd={() =>
          globalModalRendererState.removeModal(modal.key)
        }
        transitionDuration={modal.options.transitionDuration}
        openTransitionDuration={modal.options.openTransitionDuration}
        closeTransitionDuration={modal.options.closeTransitionDuration}
      >
        {React.createElement(modal.element, modal.props)}
      </ModalBase>
    </ModalContext.Provider>
  );
};
