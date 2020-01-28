import assert from "assert";
import "mocha";
import { BaseKVStore } from "./base";
import { KVStoreProvider } from "./interface";

let store: { [key: string]: any } = {};
const MemoryKVStoreProvider: KVStoreProvider = {
  get: () => {
    return Promise.resolve(store);
  },
  set: items => {
    store = { ...store, ...items };
    return Promise.resolve();
  }
};

describe("Test kvstore", () => {
  it("kvstore should not conflict", async () => {
    const test1KVStore = new BaseKVStore(MemoryKVStoreProvider, "test1");
    const test2KVStore = new BaseKVStore(MemoryKVStoreProvider, "test2");

    const key = "key";
    await test1KVStore.set(key, "test1");

    let valueFromTest2 = await test2KVStore.get(key);
    assert.strictEqual(valueFromTest2, undefined);

    await test2KVStore.set(key, "test2");
    const valueFromTest1 = await test1KVStore.get(key);
    valueFromTest2 = await test2KVStore.get(key);
    assert.strictEqual(valueFromTest1, "test1");
    assert.strictEqual(valueFromTest2, "test2");
  });
});
