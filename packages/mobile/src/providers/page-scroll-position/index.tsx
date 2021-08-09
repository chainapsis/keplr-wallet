import React, { FunctionComponent, useContext, useState } from "react";

export interface PageScrollPosition {
  scrollY?: number;

  setScrollY(value: number | undefined): void;
}

export const PageScrollPositionContext = React.createContext<PageScrollPosition | null>(
  null
);

export const PageScrollPositionProvider: FunctionComponent = ({ children }) => {
  const [scrollY, setScrollY] = useState<number | undefined>();

  return (
    <PageScrollPositionContext.Provider value={{ scrollY, setScrollY }}>
      {children}
    </PageScrollPositionContext.Provider>
  );
};

export const usePageScrollPosition = () => {
  const context = useContext(PageScrollPositionContext);
  if (!context) {
    throw new Error("You forgot to use PageScrollPositionProvider");
  }
  return context;
};
