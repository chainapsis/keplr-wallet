import { KVStore } from "./interface";

export class LocalKVStore implements KVStore {
  constructor(private readonly _prefix: string) {}

  get<T = unknown>(key: string): Promise<T | undefined> {
    const k = this.prefix() + "/" + key;

    const data = localStorage.getItem(k);
    if (data === null) {
      return Promise.resolve(undefined);
    }
    return Promise.resolve(JSON.parse(data));
  }

  set<T = unknown>(key: string, data: T | null): Promise<void> {
    const k = this.prefix() + "/" + key;

    if (data === null) {
      return Promise.resolve(localStorage.removeItem(k));
    }

    return Promise.resolve(localStorage.setItem(k, JSON.stringify(data)));
  }

  prefix(): string {
    return this._prefix;
  }
}
