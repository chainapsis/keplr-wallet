import React, { FunctionComponent } from "react";
import { Provider } from "react-redux";
import { store } from "@chatStore/index";

export const ChatStoreProvider: FunctionComponent = ({ children }) => {
  return <Provider store={store}>{children}</Provider>;
};
