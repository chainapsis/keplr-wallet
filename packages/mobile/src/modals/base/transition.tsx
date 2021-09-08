import React, { FunctionComponent, useState } from "react";
import Animated from "react-native-reanimated";

export type ModalTransition = {
  clock: Animated.Clock;
  startY: Animated.Value<number>;

  translateY: Animated.Value<number>;
  finished: Animated.Value<number>;
  time: Animated.Value<number>;
  frameTime: Animated.Value<number>;

  // If modal is open, set 1,
  // else, set -1.
  isOpen: Animated.Value<number>;
  isInitialized: Animated.Value<number>;
  isPaused: Animated.Value<number>;

  // Used as local variable
  duration: Animated.Value<number>;
  durationSetOnExternal: Animated.Value<number>;
};

export const ModalTransisionContext = React.createContext<ModalTransition | null>(
  null
);

export const ModalTransisionProvider: FunctionComponent = ({ children }) => {
  const [state] = useState(() => {
    return {
      clock: new Animated.Clock(),
      startY: new Animated.Value(0),

      translateY: new Animated.Value(0),
      finished: new Animated.Value(0),
      time: new Animated.Value(0),
      frameTime: new Animated.Value(0),

      isOpen: new Animated.Value(1),
      isInitialized: new Animated.Value(0),
      isPaused: new Animated.Value(0),

      duration: new Animated.Value(0),
      durationSetOnExternal: new Animated.Value(0),
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
