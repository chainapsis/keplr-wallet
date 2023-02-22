import { KVStore, KVStoreProvider } from "./interface";
import { JSONUint8Array } from "../json";

export class BaseKVStore implements KVStore {
  constructor(
    private readonly provider: KVStoreProvider,
    private readonly _prefix: string
  ) {}

  async get<T = unknown>(key: string): Promise<T | undefined> {
    const k = this.prefix() + "/" + key;

    const data = await this.provider.get();
    return JSONUint8Array.unwrap(data[k]);
  }

  set<T = unknown>(key: string, data: T | null): Promise<void> {
    const k = this.prefix() + "/" + key;

    return this.provider.set({ [k]: JSONUint8Array.wrap(data) });
  }

  prefix(): string {
    return this._prefix;
  }
}
