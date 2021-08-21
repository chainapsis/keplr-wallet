import React, { FunctionComponent, useContext, useState } from "react";
import { LoadingScreenModal } from "./modal";

export interface LoadingScreen {
  isLoading: boolean;
  setIsLoading(value: boolean): void;
}

export const LoadingScreenContext = React.createContext<LoadingScreen | null>(
  null
);

export const LoadingScreenProvider: FunctionComponent = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <LoadingScreenContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
      {isLoading ? (
        <LoadingScreenModal
          isOpen={true}
          close={() => {
            // noop
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
