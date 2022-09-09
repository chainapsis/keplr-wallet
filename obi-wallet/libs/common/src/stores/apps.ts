import { KVStore, toGenerator } from "@keplr-wallet/common";
import {
  action,
  flow,
  makeObservable,
  observable,
  runInAction,
  toJS,
} from "mobx";

export interface App {
  label: string;
  url: string;
  icon?: string;
}

// TODO: this is probably something that we want to fetch dynamically from a server / GitHub.
// This way, we won't need to bundle the images with the mobile app and can update the list
// without having to update the mobile app.
const knownApps: App[] = [];

export class AppsStore {
  @observable
  public favorites: App[] = [];

  constructor(protected readonly kvStore: KVStore) {
    makeObservable(this);
    this.init();
  }

  @flow
  protected *init() {
    const favorites = yield* toGenerator(
      this.kvStore.get<App[] | undefined>("favorites")
    );
    this.favorites = favorites ?? knownApps;
  }

  protected async save() {
    const data = toJS(this.favorites);
    await this.kvStore.set("favorites", data);
  }

  public getKnownApps() {
    return knownApps;
  }

  public hasFavorite(url: string) {
    return this.favorites.find((app) => app.url === url) !== undefined;
  }

  @action
  public addFavorite(app: App) {
    if (!this.hasFavorite(app.url)) {
      this.favorites = [...this.favorites, app];
      void this.save();
    }
  }

  @action
  public removeFavoriteByUrl(url: string) {
    this.favorites = this.favorites.filter((app) => app.url !== url);
    void this.save();
  }
}
