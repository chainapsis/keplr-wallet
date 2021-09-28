import React, { FunctionComponent, useState } from "react";

import { createRootStore, RootStore } from "./root";

const storeContext = React.createContext<RootStore | null>(null);

/*
 I don't know why react native works that way.
 But, react native clears all view and create new views when window size changes of the app exits by back button on android.
 So, rootStore can be made multiple times if it handles on the provider.
 To prevent this problem, handle the root store statically.
 */
let rootStore: RootStore | undefined;

export const StoreProvider: FunctionComponent = ({ children }) => {
  const [stores] = useState(() => {
    if (rootStore) {
      return rootStore;
    }

    rootStore = createRootStore();
    return rootStore;
  });

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
