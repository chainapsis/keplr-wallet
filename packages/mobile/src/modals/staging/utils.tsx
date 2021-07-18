import React, { FunctionComponent, useEffect } from "react";
import { globalModalRendererState } from "./provider";
import { useModalState } from "./hooks";

export const registerModal: <P>(
  element: React.ElementType<P>
) => FunctionComponent<P> = (element) => {
  return (props) => {
    const modalState = useModalState();

    useEffect(() => {
      globalModalRendererState.pushModal(element, props);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      globalModalRendererState.updateModal(modalState.key, props);
    });

    return null;
  };
};
