import assert from "assert";
import "mocha";
import { MemoryKVStore } from "./memory";

describe("Test kvstore", () => {
  it("kvstore should not conflict", async () => {
    const test1KVStore = new MemoryKVStore("test1");
    const test2KVStore = new MemoryKVStore("test2");

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
