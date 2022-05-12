import { BaseKVStore } from "./base";
import { KVStoreProvider } from "./interface";

const ExtensionKVStoreProvider: KVStoreProvider = {
  get:
    typeof browser !== "undefined" &&
    typeof browser.storage !== "undefined" &&
    typeof browser.storage.local !== "undefined"
      ? browser.storage.local.get
      : (undefined as any),
  set:
    typeof browser !== "undefined" &&
    typeof browser.storage !== "undefined" &&
    typeof browser.storage.local !== "undefined"
      ? browser.storage.local.set
      : (undefined as any),
};

export class ExtensionKVStore extends BaseKVStore {
  constructor(prefix: string) {
    super(ExtensionKVStoreProvider, prefix);
  }
}
