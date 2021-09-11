import { action, computed, makeObservable, observable } from "mobx";
import EventEmitter from "eventemitter3";
import { computedFn } from "mobx-utils";

type UrlInfo = {
  url: string;
  key: string;
  isInternal: boolean;
};

export class InteractionModalStore {
  protected static EventEmitter = new EventEmitter();

  public static pushUrl(url: string, isInternal: boolean) {
    InteractionModalStore.EventEmitter.emit("push", {
      url,
      isInternal,
    });
  }

  protected static lastKey: number = 0;

  protected static getKey(): string {
    InteractionModalStore.lastKey++;
    return InteractionModalStore.lastKey.toString();
  }

  @observable.shallow
  protected _urlInfos: UrlInfo[] = [];

  constructor() {
    makeObservable(this);

    InteractionModalStore.EventEmitter.addListener(
      "push",
      (data: { url: string; isInternal: boolean }) => {
        this.pushUrl(data.url, data.isInternal);
      }
    );
  }

  @computed
  get urlInfos(): UrlInfo[] {
    return this._urlInfos;
  }

  getUrlInfo = computedFn((key: string) => {
    return this.urlInfos.find((info) => info.key === key);
  });

  @action
  pushUrl(url: string, isInternal: boolean) {
    this._urlInfos.push({
      url,
      isInternal,
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
