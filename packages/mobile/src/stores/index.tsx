import React, {FunctionComponent, PropsWithChildren, useState} from 'react';

import {createRootStore, RootStore} from './root';

const storeContext = React.createContext<RootStore | null>(null);

export const StoreProvider: FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const [stores] = useState(() => createRootStore());

  return (
    <storeContext.Provider value={stores}>{children}</storeContext.Provider>
  );
};

export const useStore = () => {
  const store = React.useContext(storeContext);
  if (!store) {
    throw new Error('You have forgot to use StoreProvider');
  }
  return store;
};
