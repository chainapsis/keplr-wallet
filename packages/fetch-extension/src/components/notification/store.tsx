import React, { FunctionComponent } from "react";
import { NotificationProperty } from "./index";
import { action, observable, IObservableArray, makeObservable } from "mobx";

export const NotificationStoreContext =
  React.createContext<NotificationStore | null>(null);

export const NotificationStoreProvider: FunctionComponent = ({ children }) => (
  <NotificationStoreContext.Provider value={new NotificationStore()}>
    {children}
  </NotificationStoreContext.Provider>
);

export const useNotificationStore = () => {
  const store = React.useContext(NotificationStoreContext);
  if (!store) {
    throw new Error("You have forgot to use StoreProvider");
  }
  return store;
};

export class NotificationStore {
  @observable
  public topLeftProperties: NotificationProperty[] = [];
  @observable
  public topCenterProperties: NotificationProperty[] = [];
  @observable
  public topRightProperties: NotificationProperty[] = [];

  constructor() {
    makeObservable(this);
  }

  @action
  setTopLeftProperties(properties: NotificationProperty[]) {
    this.topLeftProperties = properties;
  }

  @action
  setTopCenterProperties(properties: NotificationProperty[]) {
    this.topCenterProperties = properties;
  }

  @action
  setTopRightProperties(properties: NotificationProperty[]) {
    this.topRightProperties = properties;
  }

  @action
  pushTopLeftProperty(property: NotificationProperty) {
    this.topLeftProperties.push(property);
  }

  @action
  pushTopCenterProperty(property: NotificationProperty) {
    this.topCenterProperties.push(property);
  }

  @action
  pushTopRightProperty(property: NotificationProperty) {
    this.topRightProperties.push(property);
  }

  @action
  removeTopLeftProperty(id: string) {
    const target = this.topLeftProperties.find((property) => {
      return property.id === id;
    });

    if (target) {
      (this.topLeftProperties as IObservableArray).remove(target);
    }
  }

  @action
  removeTopCenterProperty(id: string) {
    const target = this.topCenterProperties.find((property) => {
      return property.id === id;
    });

    if (target) {
      (this.topCenterProperties as IObservableArray).remove(target);
    }
  }

  @action
  removeTopRightProperty(id: string) {
    const target = this.topRightProperties.find((property) => {
      return property.id === id;
    });

    if (target) {
      (this.topRightProperties as IObservableArray).remove(target);
    }
  }
}
