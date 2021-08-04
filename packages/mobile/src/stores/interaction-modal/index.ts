import { action, computed, makeObservable, observable } from "mobx";

import EventEmitter from "eventemitter3";

export class InteractionModalStore {
  protected static EventEmitter = new EventEmitter();

  public static pushUrl(url: string) {
    InteractionModalStore.EventEmitter.emit("push", url);
  }

  protected static lastKey: number = 0;

  protected static getKey(): string {
    InteractionModalStore.lastKey++;
    return InteractionModalStore.lastKey.toString();
  }

  @observable.shallow
  protected _urlInfos: {
    url: string;
    key: string;
  }[] = [];

  constructor() {
    makeObservable(this);

    InteractionModalStore.EventEmitter.addListener("push", (url: string) => {
      this.pushUrl(url);
    });
  }

  @computed
  get urlInfos(): {
    url: string;
    key: string;
  }[] {
    return this._urlInfos;
  }

  @action
  pushUrl(url: string) {
    this._urlInfos.push({
      url,
      key: InteractionModalStore.getKey(),
    });
  }

  @action
  popUrl(): string | undefined {
    return this._urlInfos.splice(this._urlInfos.length - 1, 1)[0]?.url;
  }

  @action
  popAll(url: string) {
    this._urlInfos = this._urlInfos.filter(
      ({ url: currentUrl }) => url !== currentUrl
    );
  }
}
