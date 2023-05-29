import { BaseKVStore } from "./base";
import { KVStoreProvider, MultiGet } from "./interface";

export class ExtensionKVStore extends BaseKVStore implements MultiGet {
  protected static KVStoreProvider:
    | (KVStoreProvider & {
        multiGet: (keys: string[]) => Promise<{ [key: string]: any }>;
      })
    | undefined;

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
          multiGet: browser.storage.local.get,
        };
      }
    }

    if (!ExtensionKVStore.KVStoreProvider) {
      throw new Error("Can't initialize kv store for browser extension");
    }

    super(ExtensionKVStore.KVStoreProvider, prefix);
  }

  async multiGet(keys: string[]): Promise<{ [key: string]: any }> {
    // Remove duplications
    keys = Array.from(new Set(keys));

    const res =
      (await ExtensionKVStore.KVStoreProvider!.multiGet(
        keys.map((k) => this.prefix() + "/" + k)
      )) ?? {};
    const prefixedKeys = Object.keys(res);
    for (const prefixedKey of prefixedKeys) {
      const key = prefixedKey.slice(this.prefix().length + 1);
      res[key] = res[prefixedKey];

      delete res[prefixedKey];
    }

    return res;
  }
}
