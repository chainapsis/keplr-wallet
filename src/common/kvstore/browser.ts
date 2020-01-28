import { BaseKVStore } from "./base";
import { KVStoreProvider } from "./interface";

const BrowserKVStoreProvider: KVStoreProvider = {
  get: browser.storage.local.get,
  set: browser.storage.local.set
};

export class BrowserKVStore extends BaseKVStore {
  constructor(prefix: string) {
    super(BrowserKVStoreProvider, prefix);
  }
}
