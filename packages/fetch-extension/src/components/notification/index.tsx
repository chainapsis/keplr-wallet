import React, { FunctionComponent } from "react";

import { Variants } from "framer-motion";

import "./style.scss";
import { NotificationElementProps } from "./element";
import { NotificationContainer } from "./container";
import { useNotificationStore } from "./store";
import { observer } from "mobx-react-lite";

import { Buffer } from "buffer/";

export { NotificationStoreProvider } from "./store";

const topLeftVariants: Variants = {
  visible: {
    x: ["-100%", "0%"],
    opacity: 1,
  },
  hidden: {
    x: ["0%", "-100%"],
    opacity: 0,
  },
};

const topCenterVariants: Variants = {
  visible: {
    y: ["-100%", "0%"],
    opacity: 1,
  },
  hidden: {
    y: ["0%", "-100%"],
    opacity: 0,
  },
};

const topRightVariants: Variants = {
  visible: {
    x: ["100%", "0%"],
    opacity: 1,
  },
  hidden: {
    x: ["0%", "100%"],
    opacity: 0,
  },
};

export interface NotificationProperty extends NotificationElementProps {
  id?: string;
  placement: "top-left" | "top-center" | "top-right";
  transition: {
    duration: number; // Seconds
  };
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

  const push = (property: NotificationProperty): string | undefined => {
    if (!property.id) {
      const arr = new Uint8Array(8);
      crypto.getRandomValues(arr);
      property.id = Buffer.from(arr).toString("hex");
    }

    if (property.placement === "top-left") {
      notificationStore.pushTopLeftProperty(property);
    } else if (property.placement === "top-center") {
      notificationStore.pushTopCenterProperty(property);
    } else if (property.placement === "top-right") {
      notificationStore.pushTopRightProperty(property);
    } else {
      throw new Error("Invalid placement for notification");
    }

    return property.id;
  };

  const remove = (id: string) => {
    notificationStore.removeTopLeftProperty(id);
    notificationStore.removeTopCenterProperty(id);
    notificationStore.removeTopRightProperty(id);
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
        id="notification-top-left"
        properties={notificationStore.topLeftProperties.slice().reverse()}
        initial={{ x: "-100%", opacity: 0 }}
        variants={topLeftVariants}
      />
      <NotificationContainer
        id="notification-top-center"
        properties={notificationStore.topCenterProperties.slice().reverse()}
        initial={{ y: "-100%", opacity: 0 }}
        variants={topCenterVariants}
      />
      <NotificationContainer
        id="notification-top-right"
        properties={notificationStore.topRightProperties.slice().reverse()}
        initial={{ x: "100%", opacity: 0 }}
        variants={topRightVariants}
      />
    </NotificationContext.Provider>
  );
});
