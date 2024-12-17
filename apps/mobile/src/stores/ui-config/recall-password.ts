import {IQueriesStore} from '@keplr-wallet/stores';
import {autorun, makeObservable, observable, runInAction} from 'mobx';
import {KVStore, PrefixKVStore} from '@keplr-wallet/common';

export class RecallPasswordConfig {
  @observable
  public enabled = false;
  @observable
  public hasBeenClosed = false;

  protected readonly kvStore: KVStore;

  constructor(
    protected readonly queriesStore: IQueriesStore,
    kvStore: KVStore,
  ) {
    this.kvStore = new PrefixKVStore(kvStore, 'recall-password');

    makeObservable(this);
  }

  async init() {
    const saved = await this.kvStore.get<boolean>('hasBeenClosed');
    if (saved) {
      runInAction(() => {
        this.hasBeenClosed = saved;
      });
    }
    autorun(() => {
      this.kvStore.set<boolean>('hasBeenClosed', this.hasBeenClosed);
    });

    autorun(() => {
      const res = this.queriesStore.simpleQuery.queryGet<{
        enabled: boolean;
      }>(
        process.env['KEPLR_EXT_CONFIG_SERVER'] || 'http://unknown',
        '/recall-password/config.json',
      );
      if (res.response) {
        if (res.response.data.enabled) {
          runInAction(() => {
            this.enabled = true;
          });
        }
      }
    });
  }

  get open(): boolean {
    return this.enabled && !this.hasBeenClosed;
  }

  close() {
    runInAction(() => {
      this.hasBeenClosed = true;
    });
  }
}
