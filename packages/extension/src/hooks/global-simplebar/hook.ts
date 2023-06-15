import React from "react";
import { GlobalSimpleBar } from "./types";
import { GlobalSimpleBarContext } from "./internal";

export const useGlobarSimpleBar = (): GlobalSimpleBar => {
  const context = React.useContext(GlobalSimpleBarContext);
  if (!context) {
    throw new Error("You have forgot to use GlobalSimpleBarProvider");
  }
  return context;
};
