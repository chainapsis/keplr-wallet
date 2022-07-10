import React, { FunctionComponent, ReactNode, useState } from "react";

import { createRootStore, RootStore } from "./root";

const storeContext = React.createContext<RootStore | null>(null);

export const StoreProvider: FunctionComponent<{
  children?: ReactNode | undefined;
}> = ({ children }) => {
  const [stores] = useState(() => createRootStore());

  return (
    <storeContext.Provider value={stores}>{children}</storeContext.Provider>
  );
};

export const useStore = () => {
  const store = React.useContext(storeContext);
  if (!store) {
    throw new Error("You have forgot to use StoreProvider");
  }
  return store;
};

export { ChainStore } from "./chain";
