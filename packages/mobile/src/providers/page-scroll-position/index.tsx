import React, { FunctionComponent, useContext, useState } from "react";
import { Animated } from "react-native";

export interface PageScrollPosition {
  getScrollYValueOf(key: string): Animated.Value | undefined;

  createScrollYValueOf(key: string, initialValue: number): void;
  releaseScrollYValueOf(key: string): void;
}

export const PageScrollPositionContext = React.createContext<PageScrollPosition | null>(
  null
);

export const PageScrollPositionProvider: FunctionComponent = ({ children }) => {
  const [bucket, setBucket] = useState<{
    [key: string]: Animated.Value | undefined;
  }>({});

  const getScrollYValueOf = (key: string): Animated.Value | undefined => {
    if (key in bucket) {
      return bucket[key];
    }
  };

  const createScrollYValueOf = (key: string, initialValue: number) => {
    const value = new Animated.Value(initialValue);
    setBucket({
      ...bucket,
      [key]: value,
    });
  };

  const releaseScrollYValueOf = (key: string) => {
    delete bucket[key];
    setBucket({
      ...bucket,
    });
  };

  return (
    <PageScrollPositionContext.Provider
      value={{ getScrollYValueOf, createScrollYValueOf, releaseScrollYValueOf }}
    >
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
