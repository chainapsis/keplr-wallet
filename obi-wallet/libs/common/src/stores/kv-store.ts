import { KVStore as AbstractKVStore } from "@keplr-wallet/common";

export class KVStore implements AbstractKVStore {
  get<T = unknown>(_key: string): Promise<T | undefined> {
    return Promise.resolve(undefined);
  }

  prefix(): string {
    return "";
  }

  set<T = unknown>(_key: string, _data: T | null): Promise<void> {
    return Promise.resolve(undefined);
  }
}
