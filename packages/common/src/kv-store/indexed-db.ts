import { KVStore } from "./interface";

export class IndexedDBKVStore implements KVStore {
  protected cachedDB?: IDBDatabase;

  constructor(protected readonly _prefix: string) {}

  async get<T = unknown>(key: string): Promise<T | undefined> {
    const tx = (await this.getDB()).transaction([this.prefix()], "readonly");
    const store = tx.objectStore(this.prefix());

    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onerror = (event) => {
        event.stopPropagation();

        reject(event.target);
      };
      request.onsuccess = () => {
        if (!request.result) {
          resolve(undefined);
        } else {
          resolve(request.result.data);
        }
      };
    });
  }

  async set<T = unknown>(key: string, data: T | null): Promise<void> {
    if (data === null) {
      const tx = (await this.getDB()).transaction([this.prefix()], "readwrite");
      const store = tx.objectStore(this.prefix());

      return new Promise((resolve, reject) => {
        const request = store.delete(key);
        request.onerror = (event) => {
          event.stopPropagation();

          reject(event.target);
        };
        request.onsuccess = () => {
          resolve();
        };
      });
    } else {
      const tx = (await this.getDB()).transaction([this.prefix()], "readwrite");
      const store = tx.objectStore(this.prefix());

      return new Promise((resolve, reject) => {
        const request = store.put({
          key,
          data,
        });
        request.onerror = (event) => {
          event.stopPropagation();

          reject(event.target);
        };
        request.onsuccess = () => {
          resolve();
        };
      });
    }
  }

  prefix(): string {
    return this._prefix;
  }

  protected async getDB(): Promise<IDBDatabase> {
    if (this.cachedDB) {
      return this.cachedDB;
    }

    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(this.prefix());
      request.onerror = (event) => {
        event.stopPropagation();
        reject(event.target);
      };

      request.onupgradeneeded = (event) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const db = event.target.result;

        db.createObjectStore(this.prefix(), { keyPath: "key" });
      };

      request.onsuccess = () => {
        this.cachedDB = request.result;
        resolve(request.result);
      };
    });
  }
}
