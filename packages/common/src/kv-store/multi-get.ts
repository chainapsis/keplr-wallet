import { KVStore, MultiGet } from "./interface";

export class WrapMultiGetKVStore implements MultiGet {
  constructor(protected readonly kvStore: KVStore) {}

  async multiGet(keys: string[]): Promise<{ [key: string]: any }> {
    const res: { [key: string]: any } = {};

    for (const key of keys) {
      res[key] = await this.kvStore.get(key);
    }

    return res;
  }
}
