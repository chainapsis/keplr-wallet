import React, { FunctionComponent, useState } from "react";

export type ModalTransition = {
  startY: number;

  translateY: number;
  finished: number;
  time: number;
  frameTime: number;

  // If modal is open, set 1,
  // else, set -1.
  isOpen: number;
  isInitialized: number;
  isPaused: number;

  // Used as local variable
  duration: number;
  durationSetOnExternal: number;
};

export const ModalTransisionContext = React.createContext<any | null>(null);

export const ModalTransisionProvider: FunctionComponent = ({ children }) => {
  const [state] = useState(() => {
    return {
      startY: 0,

      translateY: 0,
      finished: 0,
      time: 0,
      frameTime: 0,

      isOpen: 1,
      isInitialized: 0,
      isPaused: 0,

      duration: 0,
      durationSetOnExternal: 0,
    };
  });
  return (
    <ModalTransisionContext.Provider value={state}>
      {children}
    </ModalTransisionContext.Provider>
  );
};

export const useModalTransision = () => {
  const context = React.useContext(ModalTransisionContext);
  if (!context) {
    throw new Error("Can't find ModalTransisionContext");
  }
  return context;
};
