import { KVStore } from '@keplr-wallet/common';
import { AppsStore } from '@keplr-wallet/stores';

class MockKVStore implements KVStore {
  get<T = unknown>(_key: string): Promise<T | undefined> {
    return Promise.resolve(undefined);
  }

  prefix(): string {
    return '';
  }

  set<T = unknown>(_key: string, _data: T | null): Promise<void> {
    return Promise.resolve(undefined);
  }
}

export class RootStore {
  public readonly appsStore: AppsStore;

  constructor() {
    // TODO: KVStore
    this.appsStore = new AppsStore(new MockKVStore());
  }
}
