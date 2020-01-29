import { BaseKVStore } from "./base";
import { KVStoreProvider } from "./interface";

let store: { [key: string]: any } = {};
const MemoryKVStoreProvider: KVStoreProvider = {
  get: () => {
    return Promise.resolve(store);
  },
  set: items => {
    store = { ...store, ...items };
    return Promise.resolve();
  }
};

export class MemoryKVStore extends BaseKVStore {
  constructor(prefix: string) {
    super(MemoryKVStoreProvider, prefix);
  }
}
