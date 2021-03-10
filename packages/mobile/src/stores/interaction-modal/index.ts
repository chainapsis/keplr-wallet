import { action, makeObservable, observable } from "mobx";

import EventEmitter from "eventemitter3";

export class InteractionModalStore {
  protected static EventEmitter = new EventEmitter();

  public static pushUrl(url: string) {
    InteractionModalStore.EventEmitter.emit("push", url);
  }

  @observable.shallow
  protected _urls: string[] = [];

  constructor() {
    makeObservable(this);

    InteractionModalStore.EventEmitter.addListener("push", (url: string) => {
      this.pushUrl(url);
    });
  }

  get lastUrl(): string | undefined {
    return this._urls[this._urls.length - 1];
  }

  get urls(): readonly string[] {
    return this._urls;
  }

  @action
  pushUrl(url: string) {
    this._urls.push(url);
  }

  @action
  popUrl(): string | undefined {
    return this._urls.splice(this._urls.length - 1, 1)[0];
  }
}
