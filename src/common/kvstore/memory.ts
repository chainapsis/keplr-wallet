import { BaseKVStore } from "./base";
import { KVStoreProvider } from "./interface";

class MemoryKVStoreProvider implements KVStoreProvider {
  private store: { [key: string]: any } = {};

  get() {
    return Promise.resolve(this.store);
  }

  set(items: { [key: string]: any }) {
    this.store = { ...this.store, ...items };
    return Promise.resolve();
  }
}

export class MemoryKVStore extends BaseKVStore {
  constructor(prefix: string) {
    super(new MemoryKVStoreProvider(), prefix);
  }
}
