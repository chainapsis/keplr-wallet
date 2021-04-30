import React, { FunctionComponent } from "react";

import { NotificationElementProps } from "./element";
import { NotificationContainer } from "./container";
import { useNotificationStore } from "./store";
import { observer } from "mobx-react-lite";
import { getRandomBytesAsync } from "expo-random";
import { Dimensions } from "react-native";
export { NotificationStoreProvider } from "./store";

export interface NotificationProperty extends NotificationElementProps {
  id?: string;
  placement: "top-left" | "top-center" | "top-right";
}

export interface ContextProps {
  push: (property: NotificationProperty) => string | undefined;
  remove: (id: string) => void;
}

export const NotificationContext = React.createContext<ContextProps>(
  undefined as any
);

export const useNotification = () => {
  const store = React.useContext(NotificationContext);
  if (!store) {
    throw new Error("You have forgot to use StoreProvider");
  }
  return store;
};

export const NotificationProvider: FunctionComponent = observer((props) => {
  const { children } = props;

  const notificationStore = useNotificationStore();

  const push = async (property: NotificationProperty): string | undefined => {
    if (!property.id) {
      const arr = await getRandomBytesAsync(8);
      property.id = Buffer.from(arr).toString("hex");
    }

    if (property.placement === "top-left") {
      notificationStore.pushTopProperty(property);
    } else if (property.placement === "top-center") {
      notificationStore.pushMiddleProperty(property);
    } else if (property.placement === "top-right") {
      notificationStore.pushBottomProperty(property);
    } else {
      throw new Error("Invalid placement for notification");
    }

    return property.id;
  };

  const remove = (id: string) => {
    notificationStore.removeTopProperty(id);
    notificationStore.removeMiddleProperty(id);
    notificationStore.removeBottomProperty(id);
  };

  return (
    <NotificationContext.Provider
      value={{
        push,
        remove,
      }}
    >
      {children}
      <NotificationContainer
        properties={notificationStore.topProperties.slice().reverse()}
        initial={{
          position: "absolute",
          top: 0,
          left: 0,
        }}
      />
      <NotificationContainer
        properties={notificationStore.middleProperties.slice().reverse()}
        initial={{
          position: "absolute",
          top: 0,
          left: 0,
        }}
      />
      <NotificationContainer
        properties={notificationStore.bottomProperties.slice().reverse()}
        initial={{
          position: "absolute",
          bottom: 0,
          left: 0,
        }}
      />
    </NotificationContext.Provider>
  );
});
