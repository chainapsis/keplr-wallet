import React, { createContext } from "react";
import { Notification } from "../types";

export const NotificationContext = createContext<Notification | null>(null);

export const useNotification = (): Notification => {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error("You have forgot to use NotificationProvider");
  }
  return context;
};
