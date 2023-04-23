import React from "react";
import { Confirm } from "./types";
import { ConfirmContext } from "./internal";

export const useConfirm = (): Confirm => {
  const context = React.useContext(ConfirmContext);
  if (!context) {
    throw new Error("You have forgot to use ConfirmProvider");
  }
  return context;
};
