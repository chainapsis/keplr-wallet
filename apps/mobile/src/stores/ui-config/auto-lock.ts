import {KVStore, PrefixKVStore} from '@keplr-wallet/common';
import {autorun, makeObservable, observable, runInAction} from 'mobx';
import {ChainStore} from '../chain';

export class AutoLockConfig {
  protected readonly kvStore: KVStore;

  @observable
  protected _isEnableAutoLock = false;

  constructor(kvStore: KVStore, protected readonly chainStore: ChainStore) {
    this.kvStore = new PrefixKVStore(kvStore, 'auto-lock');

    makeObservable(this);
  }

  async init(): Promise<void> {
    const saved = await this.kvStore.get<boolean>('auto-lock');
    runInAction(() => {
      this._isEnableAutoLock = saved || false;
    });
    autorun(() => {
      this.kvStore.set('auto-lock', this._isEnableAutoLock);
    });
  }

  enableAutoLock() {
    runInAction(() => {
      this._isEnableAutoLock = true;
    });
  }

  disableAutoLock() {
    runInAction(() => {
      this._isEnableAutoLock = false;
    });
  }

  get isEnableAutoLock(): boolean {
    return this._isEnableAutoLock;
  }
}
