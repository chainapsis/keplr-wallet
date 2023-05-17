import { BaseKVStore } from "./base";
import { KVStoreProvider } from "./interface";

export class ExtensionKVStore extends BaseKVStore {
  protected static KVStoreProvider: KVStoreProvider | undefined;

  constructor(prefix: string) {
    if (!ExtensionKVStore.KVStoreProvider) {
      if (typeof browser === "undefined") {
        console.log(
          "You should use ExtensionKVStore on the extension environment."
        );
      } else if (!browser.storage || !browser.storage.local) {
        console.log(
          "The 'browser' exists, but it doesn't seem to be an extension environment. This can happen in Safari browser."
        );
      } else {
        ExtensionKVStore.KVStoreProvider = {
          get: browser.storage.local.get,
          set: browser.storage.local.set,
        };
      }
    }

    if (!ExtensionKVStore.KVStoreProvider) {
      throw new Error("Can't initialize kv store for browser extension");
    }

    super(ExtensionKVStore.KVStoreProvider, prefix);
  }
}
