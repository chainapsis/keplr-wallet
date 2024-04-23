import React, {
  FunctionComponent,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';
import {globalModalStates, ModalOptions} from './state';

export const registerModal: <P>(
  element: React.ElementType<P>,
  options?: ModalOptions,
) => FunctionComponent<
  P & {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
  }
> = (element, options) => {
  return props => {
    const id = useRef<string | undefined>();

    useEffect(() => {
      return () => {
        if (id.current) {
          globalModalStates.detachModal(id.current);
          id.current = undefined;
        }
      };
    }, []);

    useLayoutEffect(() => {
      if (props.isOpen) {
        if (!id.current) {
          id.current = globalModalStates.createModal(
            element,
            props,
            options ?? {},
            () => {
              id.current = undefined;
            },
          );
        } else {
          const modal = globalModalStates.getModal(id.current);
          if (modal) {
            modal.setIsClosing(false);
          }
        }
      } else {
        if (id.current) {
          const modal = globalModalStates.getModal(id.current);
          if (modal) {
            modal.setIsClosing(true);
          }
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.isOpen]);

    useLayoutEffect(() => {
      if (id.current) {
        globalModalStates.updateProps(id.current, props);
      }
    });

    return null;
  };
};
