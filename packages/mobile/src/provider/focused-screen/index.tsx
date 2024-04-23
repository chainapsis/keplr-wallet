import React, {
  FunctionComponent,
  PropsWithChildren,
  useContext,
  useState,
} from 'react';

export interface FocusedScreen {
  name: string | undefined;
  key: string | undefined;

  setCurrent(current: {name: string; key: string}): void;
}

export const FocusedScreenContext = React.createContext<FocusedScreen | null>(
  null,
);

export const FocusedScreenProvider: FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const [current, setCurrent] = useState<
    {name: string; key: string} | undefined
  >();

  return (
    <FocusedScreenContext.Provider
      value={{name: current?.name, key: current?.key, setCurrent}}>
      {children}
    </FocusedScreenContext.Provider>
  );
};

export const useFocusedScreen = () => {
  const context = useContext(FocusedScreenContext);
  if (!context) {
    throw new Error('You forgot to use FocusedScreenProvider');
  }
  return context;
};
