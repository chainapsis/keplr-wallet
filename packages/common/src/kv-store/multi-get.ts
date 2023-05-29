import { KVStore, MultiGet } from "./interface";

export class WrapMultiGetKVStore implements MultiGet {
  constructor(protected readonly kvStore: KVStore) {}

  async multiGet(keys: string[]): Promise<{ [key: string]: any }> {
    // Remove duplications
    keys = Array.from(new Set(keys));

    const res: { [key: string]: any } = {};

    const promises: Promise<void>[] = [];

    for (const key of keys) {
      promises.push(
        (async () => {
          res[key] = await this.kvStore.get(key);
        })()
      );
    }

    await Promise.all(promises);

    return res;
  }
}
