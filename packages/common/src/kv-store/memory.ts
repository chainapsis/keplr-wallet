import { BaseKVStore } from "./base";
import { KVStoreProvider } from "./interface";

class MemoryKVStoreProvider implements KVStoreProvider {
  private store: { [key: string]: any } = {};

  get(key: string) {
    return Promise.resolve({
      [key]: this.store[key],
    });
  }

  set(items: { [key: string]: any }) {
    // Generally, memory kv store is used for testing, and mocking.
    // However, we can store non-primitive type to memory even though local storage generally can't do that.
    // To mitigate the risk, we check the type of value to be stored if env is for testing.
    if (
      typeof process !== "undefined" &&
      (process.env["NODE_ENV"] === "test" ||
        process.env["NODE_ENV"] === "development")
    ) {
      this.checkNotPrimitiveField(items);
    }

    this.store = { ...this.store, ...items };
    return Promise.resolve();
  }

  protected checkNotPrimitiveField(items: { [key: string]: any }) {
    Object.keys(items).forEach((key) => {
      const value = items[key];
      if (value != null && typeof value === "object") {
        if (value.constructor !== Object && value.constructor !== Array) {
          throw new Error(
            `${key} may not be serializable: ${value.constructor.name}`
          );
        }

        this.checkNotPrimitiveField(value);
      }
    });
  }
}

export class MemoryKVStore extends BaseKVStore {
  constructor(prefix: string) {
    super(new MemoryKVStoreProvider(), prefix);
  }
}
