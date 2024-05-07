import React, { FunctionComponent, PropsWithChildren, useState } from "react";
import { Header, HeaderContext } from "./types";

const storeContext = React.createContext<HeaderContext | null>(null);

export const RegisterHeaderProvider: FunctionComponent<
  PropsWithChildren<HeaderContext>
> = ({ children, ...props }) => {
  return (
    <storeContext.Provider value={props}>{children}</storeContext.Provider>
  );
};

export const useRegisterHeaderContext = (
  initialHeader: Header
): HeaderContext => {
  const [header, setHeader] = useState<Header>(initialHeader);

  return {
    header,
    setHeader,
  };
};

export const useRegisterHeader = () => {
  const store = React.useContext(storeContext);
  if (!store) {
    throw new Error("You have forgot to use RegisterHeaderProvider");
  }
  return store;
};
