import {action, flow, makeObservable, observable} from 'mobx';
import {KVStore, toGenerator} from '@keplr-wallet/common';
import {FavoriteUrl, SearchedUrl} from './types.ts';

const maxFavoriteUrls = 5;

export class WebpageStore {
  @observable
  protected _favoriteUrls: FavoriteUrl[] = [];

  @observable
  protected _searchedUrls: SearchedUrl[] = [];

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly migrations: {
      readonly kvStore: KVStore;
    },
  ) {
    makeObservable(this);

    this.init();
  }

  @flow
  protected *init() {
    const migrated = yield* toGenerator(
      this.kvStore.get<boolean>('migration/favorite_url'),
    );

    if (!migrated) {
      const legacyFavoriteUrls = yield* toGenerator(
        this.migrations.kvStore.get<string[]>('urls'),
      );

      if (legacyFavoriteUrls) {
        this._favoriteUrls = legacyFavoriteUrls.map(url => ({url, name: url}));
        this.saveFavoriteUrls();
      }

      yield* toGenerator(this.kvStore.set('migration/favorite_url', true));
    } else {
      const savedFavoriteUrls = yield* toGenerator(
        this.kvStore.get<FavoriteUrl[]>('favoriteUrls'),
      );

      this._favoriteUrls = savedFavoriteUrls ?? [];
    }

    const savedSearchedUrls = yield* toGenerator(
      this.kvStore.get<FavoriteUrl[]>('searchedUrls'),
    );

    this._searchedUrls = savedSearchedUrls ?? [];
  }

  get favoriteUrls(): FavoriteUrl[] {
    return this._favoriteUrls;
  }

  get searchedUrls(): SearchedUrl[] {
    return this._searchedUrls.slice(0, maxFavoriteUrls);
  }

  isFavoriteUrlSaved(url: string): boolean {
    return this._favoriteUrls.some(saved => saved.url === url);
  }

  @action
  addFavoriteUrl(url: FavoriteUrl) {
    this._favoriteUrls = [url, ...this._favoriteUrls];

    this.saveFavoriteUrls();
  }

  @action
  addSearchedUrl(url: string) {
    this._searchedUrls = [{url}, ...this._searchedUrls];

    this.saveSearchedUrls();
  }

  @action
  removeFavoriteUrl(url: string) {
    this._favoriteUrls = this._favoriteUrls.filter(saved => saved.url !== url);

    this.saveFavoriteUrls();
  }

  @action
  editFavoriteUrl(url: FavoriteUrl) {
    this._favoriteUrls = this._favoriteUrls.map(saved => {
      if (saved.url === url.url) {
        return url;
      }

      return saved;
    });

    this.saveFavoriteUrls();
  }

  protected async saveFavoriteUrls() {
    await this.kvStore.set('favoriteUrls', this._favoriteUrls);
  }

  protected async saveSearchedUrls() {
    await this.kvStore.set('searchedUrls', this._searchedUrls);
  }
}
