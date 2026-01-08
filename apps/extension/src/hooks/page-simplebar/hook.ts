import React from "react";
import { PageSimpleBar } from "./types";
import { PageSimpleBarContext } from "./internal";

export const usePageSimpleBar = (): PageSimpleBar => {
  const context = React.useContext(PageSimpleBarContext);
  if (!context) {
    throw new Error("You have forgot to use PageSimpleBarProvider");
  }
  return context;
};
