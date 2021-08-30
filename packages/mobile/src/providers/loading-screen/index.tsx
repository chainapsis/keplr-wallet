import React, { FunctionComponent, useContext, useState } from "react";
import { LoadingScreenModal } from "./modal";
import EventEmitter from "eventemitter3";

export interface LoadingScreen {
  isLoading: boolean;
  setIsLoading(value: boolean): void;
  // Wait until the modal is opened on the UI thread actually.
  openAsync(): Promise<void>;
}

export const LoadingScreenContext = React.createContext<LoadingScreen | null>(
  null
);

export const LoadingScreenProvider: FunctionComponent = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  const [events] = useState(() => new EventEmitter());

  const openAsync = (): Promise<void> => {
    setIsLoading(true);
    return new Promise<void>((resolve) => {
      if (isLoading) {
        resolve();
      }

      const handler = () => {
        resolve();
        events.removeListener("open", handler);
      };

      events.addListener("open", handler);
    });
  };

  return (
    <LoadingScreenContext.Provider
      value={{ isLoading, setIsLoading, openAsync }}
    >
      {children}
      {isLoading ? (
        <LoadingScreenModal
          isOpen={true}
          close={() => {
            // noop
          }}
          onOpenComplete={() => {
            events.emit("open");
          }}
        />
      ) : null}
    </LoadingScreenContext.Provider>
  );
};

export const useLoadingScreen = () => {
  const context = useContext(LoadingScreenContext);
  if (!context) {
    throw new Error("You forgot to use LoadingScreenContext");
  }
  return context;
};
