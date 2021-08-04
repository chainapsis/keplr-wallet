import React, { FunctionComponent, useMemo, useState } from "react";
import {
  Modal as ReactModal,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  ViewStyle,
} from "react-native";
import { action, makeObservable, observable } from "mobx";
import { observer } from "mobx-react-lite";
import { ModalBase } from "./base";
import { ModalContext, useModalState } from "./hooks";
import { useStyle } from "../../../styles";
import Animated from "react-native-reanimated";
import { gestureHandlerRootHOC } from "react-native-gesture-handler";
import { ModalTransisionProvider, useModalTransision } from "./transition";

export interface ModalOptions {
  readonly align?: "top" | "center" | "bottom";
  readonly transitionVelocity?: number;
  readonly openTransitionVelocity?: number;
  readonly closeTransitionVelocity?: number;
  readonly disableBackdrop?: boolean;
  readonly disableClosingOnBackdropPress?: boolean;

  readonly containerStyle?: ViewStyle;
  readonly disableSafeArea?: boolean;
}

export interface Modal {
  readonly key: string;
  readonly element: React.ElementType;
  isOpen: boolean;
  props: any;
  close: () => void;
  onCloseTransitionEnd: () => void;
  options: ModalOptions;
}

export class ModalsRendererState {
  @observable.shallow
  protected _modals: Modal[] = [];

  protected static lastKey: number = 0;

  protected static getKey(): string {
    ModalsRendererState.lastKey++;
    return ModalsRendererState.lastKey.toString();
  }

  constructor() {
    makeObservable(this);
  }

  get modals(): Modal[] {
    return this._modals;
  }

  @action
  pushModal<P>(
    modal: React.ElementType<P>,
    props: P,
    close: () => void,
    onCloseTransitionEnd: () => void,
    options: ModalOptions = {
      align: "bottom",
    }
  ): string {
    const key = ModalsRendererState.getKey();

    this._modals.push({
      key,
      element: modal,
      isOpen: true,
      close,
      onCloseTransitionEnd,
      props,
      options,
    });

    return key;
  }

  @action
  closeModal(key: string) {
    const index = this._modals.findIndex((modal) => modal.key === key);
    if (index >= 0) {
      this._modals[index] = {
        ...this._modals[index],
        isOpen: false,
      };
    }
  }

  @action
  updateModal(key: string, props: any) {
    const index = this._modals.findIndex((modal) => modal.key === key);
    if (index >= 0) {
      this._modals[index] = {
        ...this._modals[index],
        props,
      };
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
        <ReactModal
          transparent={true}
          statusBarTranslucent={Platform.OS === "ios"}
        >
          <ModalRenderersRoot />
        </ReactModal>
      ) : null}
    </React.Fragment>
  );
});

export const ModalRenderersRoot: FunctionComponent = gestureHandlerRootHOC(
  observer(() => {
    return (
      <React.Fragment>
        {globalModalRendererState.modals.map((modal) => {
          return <ModalRenderer key={modal.key} modal={modal} />;
        })}
      </React.Fragment>
    );
  })
) as FunctionComponent;

export const ModalRenderer: FunctionComponent<{
  modal: Modal;
}> = observer(({ modal }) => {
  const [isOpenTransitioning, setIsOpenTransitioning] = useState(true);

  return (
    <ModalContext.Provider
      value={useMemo(() => {
        return {
          key: modal.key,
          isTransitionClosing: !modal.isOpen,
          isTransitionOpening: isOpenTransitioning,
          align: modal.options.align,
          isOpen: modal.props.isOpen,
          transitionVelocity: modal.options.transitionVelocity,
          openTransitionVelocity: modal.options.openTransitionVelocity,
          closeTransitionVelocity: modal.options.closeTransitionVelocity,
          disableBackdrop: modal.options.disableBackdrop,
          disableClosingOnBackdropPress:
            modal.options.disableClosingOnBackdropPress,
          close: modal.close,
        };
      }, [
        isOpenTransitioning,
        modal.close,
        modal.isOpen,
        modal.key,
        modal.options.align,
        modal.options.closeTransitionVelocity,
        modal.options.disableBackdrop,
        modal.options.disableClosingOnBackdropPress,
        modal.options.openTransitionVelocity,
        modal.options.transitionVelocity,
        modal.props.isOpen,
      ])}
    >
      <ModalTransisionProvider>
        <ModalBackdrop />
        <ModalBase
          align={modal.options.align}
          isOpen={modal.isOpen}
          onOpenTransitionEnd={() => {
            setIsOpenTransitioning(false);
          }}
          onCloseTransitionEnd={() => {
            globalModalRendererState.removeModal(modal.key);
            modal.onCloseTransitionEnd();
          }}
          transitionVelocity={modal.options.transitionVelocity}
          openTransitionVelocity={modal.options.openTransitionVelocity}
          closeTransitionVelocity={modal.options.closeTransitionVelocity}
          containerStyle={modal.options.containerStyle}
          disableSafeArea={modal.options.disableSafeArea}
        >
          {React.createElement(modal.element, modal.props)}
        </ModalBase>
      </ModalTransisionProvider>
    </ModalContext.Provider>
  );
});

const ModalBackdrop: FunctionComponent = () => {
  const style = useStyle();

  const modal = useModalState();
  const modalTransition = useModalTransision();

  const opacity = useMemo(() => {
    return Animated.block([
      Animated.cond(
        Animated.and(
          modalTransition.isInitialized,
          Animated.greaterThan(Animated.abs(modalTransition.startY), 0)
        ),
        [
          Animated.min(
            Animated.multiply(
              Animated.sub(
                1,
                Animated.divide(
                  Animated.abs(modalTransition.translateY),
                  Animated.abs(modalTransition.startY)
                )
              ),
              4 / 3
            ),
            1
          ),
        ],
        new Animated.Value(0)
      ),
    ]);
  }, [
    modalTransition.isInitialized,
    modalTransition.startY,
    modalTransition.translateY,
  ]);

  return (
    <React.Fragment>
      {!modal.disableBackdrop ? (
        <TouchableWithoutFeedback
          disabled={modal.disableClosingOnBackdropPress}
          onPress={() => {
            modal.close();
          }}
        >
          <Animated.View
            style={StyleSheet.flatten([
              style.flatten([
                "absolute-fill",
                "background-color-modal-backdrop",
              ]),
              {
                opacity,
              },
            ])}
          />
        </TouchableWithoutFeedback>
      ) : null}
    </React.Fragment>
  );
};
