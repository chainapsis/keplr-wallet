import { KVStore } from "./interface";

export class ChromeKVStore implements KVStore {
  constructor(private readonly _prefix: string) {}

  get<T = unknown>(key: string): Promise<T | undefined> {
    const k = this.prefix() + "/" + key;

    return new Promise((resolve, reject) => {
      chrome.storage.local.get(data => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        resolve(data[k]);
      });
    });
  }

  set<T = unknown>(key: string, data: T | null): Promise<void> {
    const k = this.prefix() + "/" + key;

    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [k]: data }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        resolve();
      });
    });
  }

  prefix(): string {
    return this._prefix;
  }
}
