export interface KVStore {
  get<T = unknown>(key: string): Promise<T | undefined>;
  set<T = unknown>(key: string, data: T | null): Promise<void>;
  prefix(): string;
}

export interface MultiGet {
  multiGet(keys: string[]): Promise<{ [key: string]: any }>;
}

export interface KVStoreProvider {
  get(key: string): Promise<{ [key: string]: any }>;
  set(items: { [key: string]: any }): Promise<void>;
}
