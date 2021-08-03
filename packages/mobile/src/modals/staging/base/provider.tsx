import React, {
  FunctionComponent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { ModalContext } from "./hooks";
import { useStyle } from "../../../styles";
import Animated, { Easing } from "react-native-reanimated";
import { gestureHandlerRootHOC } from "react-native-gesture-handler";
import { ModalTransisionProvider } from "./transition";

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
    let needBackdrop = false;
    for (const modal of globalModalRendererState.modals) {
      if (modal.isOpen && !modal.options.disableBackdrop) {
        needBackdrop = true;
        break;
      }
    }
    let isBackdropClosing = false;
    for (const modal of globalModalRendererState.modals) {
      if (!modal.isOpen && !modal.options.disableBackdrop) {
        isBackdropClosing = true;
        break;
      }
    }

    const backdropProcess = useRef(new Animated.Value(0));

    const backdropAnimated = useMemo(() => {
      return backdropProcess.current.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
      });
    }, []);

    useEffect(() => {
      if (needBackdrop) {
        Animated.timing(backdropProcess.current, {
          toValue: 1,
          duration: 150,
          easing: Easing.linear,
        }).start();
      } else {
        Animated.timing(backdropProcess.current, {
          toValue: 0,
          duration: 150,
          easing: Easing.linear,
        }).start();
      }
    }, [needBackdrop]);

    const style = useStyle();

    return (
      <React.Fragment>
        {needBackdrop || isBackdropClosing ? (
          <TouchableWithoutFeedback
            onPress={() => {
              if (globalModalRendererState.modals.length > 0) {
                const last =
                  globalModalRendererState.modals[
                    globalModalRendererState.modals.length - 1
                  ];
                if (!last.options.disableClosingOnBackdropPress) {
                  last.close();
                }
              }
            }}
          >
            <Animated.View
              style={StyleSheet.flatten([
                style.flatten([
                  "absolute-fill",
                  "background-color-modal-backdrop",
                ]),
                {
                  opacity: backdropAnimated,
                },
              ])}
            />
          </TouchableWithoutFeedback>
        ) : null}
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
          close: modal.close,
        };
      }, [
        isOpenTransitioning,
        modal.close,
        modal.isOpen,
        modal.key,
        modal.options.align,
        modal.options.closeTransitionVelocity,
        modal.options.openTransitionVelocity,
        modal.options.transitionVelocity,
        modal.props.isOpen,
      ])}
    >
      <ModalTransisionProvider>
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
