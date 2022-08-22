import { KVStore as AbstractKVStore } from "@keplr-wallet/common";
import AsyncStorage from "@react-native-async-storage/async-storage";

export class KVStore implements AbstractKVStore {
  constructor(private readonly _prefix: string) {}

  public async get<T = unknown>(key: string): Promise<T | undefined> {
    const data = await AsyncStorage.getItem(this.getKey(key));
    return data === null ? undefined : JSON.parse(data);
  }

  public async set<T = unknown>(key: string, data: T | null) {
    // Passing `null` means we want to delete the existing data item.
    return data
      ? AsyncStorage.setItem(this.getKey(key), JSON.stringify(data))
      : AsyncStorage.removeItem(this.getKey(key));
  }

  public prefix() {
    return this._prefix;
  }

  protected getKey(key: string) {
    return this.prefix() + "/" + key;
  }
}
