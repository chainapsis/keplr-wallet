import { KVStore } from "@keplr-wallet/common";
import AsyncStorage from "@react-native-async-storage/async-storage";

export class AsyncKVStore implements KVStore {
  constructor(private readonly _prefix: string) {}

  async get<T = unknown>(key: string): Promise<T | undefined> {
    const k = this.prefix() + "/" + key;

    const data = await AsyncStorage.getItem(k);
    if (data === null) {
      return Promise.resolve(undefined);
    }
    return Promise.resolve(JSON.parse(data));
  }

  async set<T = unknown>(key: string, data: T | null): Promise<void> {
    const k = this.prefix() + "/" + key;

    if (data === null) {
      await AsyncStorage.removeItem(k);
    }

    return await AsyncStorage.setItem(k, JSON.stringify(data));
  }

  prefix(): string {
    return this._prefix;
  }
}
