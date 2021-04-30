import React, { FunctionComponent } from "react";
import { NotificationProperty } from "./index";
import { action, observable, IObservableArray, makeObservable } from "mobx";

export const NotificationStoreContext = React.createContext<NotificationStore | null>(
  null
);

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
  public topProperties: NotificationProperty[] = [];
  @observable
  public middleProperties: NotificationProperty[] = [];
  @observable
  public bottomProperties: NotificationProperty[] = [];

  constructor() {
    makeObservable(this);
  }

  @action
  setTopProperties(properties: NotificationProperty[]) {
    this.topProperties = properties;
  }

  @action
  setMiddleProperties(properties: NotificationProperty[]) {
    this.middleProperties = properties;
  }

  @action
  setBottomProperties(properties: NotificationProperty[]) {
    this.bottomProperties = properties;
  }

  @action
  pushTopProperty(property: NotificationProperty) {
    this.topProperties.push(property);
  }

  @action
  pushMiddleProperty(property: NotificationProperty) {
    this.middleProperties.push(property);
  }

  @action
  pushBottomProperty(property: NotificationProperty) {
    this.bottomProperties.push(property);
  }

  @action
  removeTopProperty(id: string) {
    const target = this.topProperties.find((property) => {
      return property.id === id;
    });

    if (target) {
      (this.topProperties as IObservableArray).remove(target);
    }
  }

  @action
  removeMiddleProperty(id: string) {
    const target = this.middleProperties.find((property) => {
      return property.id === id;
    });

    if (target) {
      (this.middleProperties as IObservableArray).remove(target);
    }
  }

  @action
  removeBottomProperty(id: string) {
    const target = this.bottomProperties.find((property) => {
      return property.id === id;
    });

    if (target) {
      (this.bottomProperties as IObservableArray).remove(target);
    }
  }
}
