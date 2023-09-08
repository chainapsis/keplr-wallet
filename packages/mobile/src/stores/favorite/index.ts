import { KVStore, toGenerator } from "@keplr-wallet/common";
import { action, flow, makeObservable, observable } from "mobx";

export class FavoriteWebpageStore {
  @observable
  protected _urls: string[] = [];

  get urls(): string[] {
    return this._urls;
  }

  isSaved(url: string): boolean {
    return this._urls.some((_url) => _url === url);
  }

  constructor(protected readonly kvStore: KVStore) {
    makeObservable(this);

    this.init();
  }

  @action
  addUrl(url: string) {
    this._urls = [url, ...this._urls];

    this.save();
  }

  @action
  removeUrl(url: string) {
    this._urls = this._urls.filter((_url) => _url !== url);

    this.save();
  }

  @flow
  protected *init() {
    const saved = yield* toGenerator(this.kvStore.get<string[]>("urls"));

    this._urls = saved ?? [];
  }

  protected async save() {
    await this.kvStore.set("urls", this.urls);
  }
}
