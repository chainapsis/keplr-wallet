import React, { FunctionComponent, useEffect, useRef } from "react";
import { globalModalRendererState, ModalOptions } from "./provider";

export const registerModal: <P>(
  element: React.ElementType<P>,
  options?: ModalOptions
) => FunctionComponent<
  P & {
    isOpen: boolean;
    close: () => void;
  }
> = (element, options) => {
  return (props) => {
    const key = useRef<string | undefined>();

    useEffect(() => {
      return () => {
        if (key.current) {
          globalModalRendererState.closeModal(key.current);
        }
      };
    }, []);

    useEffect(() => {
      if (props.isOpen && !key.current) {
        key.current = globalModalRendererState.pushModal(
          element,
          props,
          props.close,
          () => {
            key.current = undefined;
          },
          options
        );
      }
      if (!props.isOpen && key.current) {
        globalModalRendererState.closeModal(key.current);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.isOpen]);

    useEffect(() => {
      if (key.current) {
        globalModalRendererState.updateModal(key.current, props);
      }
    });

    return null;
  };
};
