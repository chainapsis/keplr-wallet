import { KVStore as AbstractKVStore } from "@keplr-wallet/common";

export class KVStore implements AbstractKVStore {
  constructor(private readonly _prefix: string) {}

  get<T = unknown>(_key: string): Promise<T | undefined> {
    return Promise.resolve(undefined);
  }

  prefix(): string {
    return this._prefix;
  }

  set<T = unknown>(_key: string, _data: T | null): Promise<void> {
    return Promise.resolve(undefined);
  }
}
