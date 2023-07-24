import { KVStore } from "./interface";

export class PrefixKVStore implements KVStore {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly _prefix: string
  ) {}

  prefix(): string {
    return this._prefix;
  }

  async get<T = unknown>(key: string): Promise<T | undefined> {
    const k = this.prefix() + "/" + key;

    return await this.kvStore.get(k);
  }

  async set<T = unknown>(key: string, data: T | null): Promise<void> {
    const k = this.prefix() + "/" + key;

    return await this.kvStore.set(k, data);
  }
}
