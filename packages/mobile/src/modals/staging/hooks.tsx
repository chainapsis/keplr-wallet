import React, { useContext } from "react";

export interface ModalStateContext {
  readonly key: string;
  readonly close: () => void;
}

export const ModalContext = React.createContext<ModalStateContext | null>(null);

export const useModalState = () => {
  const state = useContext(ModalContext);
  if (!state) {
    throw new Error("You forgot to use ModalProvider");
  }

  return state;
};
