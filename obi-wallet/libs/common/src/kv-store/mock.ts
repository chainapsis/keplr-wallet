import { KVStore as AbstractKVStore } from "@keplr-wallet/common";

export class MockKVStore implements AbstractKVStore {
  static storage = new Map<string, string>();

  public static reset() {
    MockKVStore.storage.clear();
  }

  constructor(protected readonly _prefix: string) {}

  public async get<T = unknown>(key: string): Promise<T | undefined> {
    const data = MockKVStore.storage.get(this.getKey(key));
    return data ? JSON.parse(data) : undefined;
  }

  public async set<T = unknown>(key: string, data: T | null): Promise<void> {
    if (data === null || data === undefined) {
      MockKVStore.storage.delete(this.getKey(key));
    } else {
      MockKVStore.storage.set(this.getKey(key), JSON.stringify(data));
    }
  }

  public prefix() {
    return this._prefix;
  }

  protected getKey(key: string) {
    return this.prefix() + "/" + key;
  }
}
