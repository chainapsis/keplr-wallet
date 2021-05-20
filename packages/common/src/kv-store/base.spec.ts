import { MemoryKVStore } from "./memory";

describe("Test kvstore", () => {
  test("kvstore should not conflict", async () => {
    const test1KVStore = new MemoryKVStore("test1");
    const test2KVStore = new MemoryKVStore("test2");

    const key = "key";
    await test1KVStore.set(key, "test1");

    let valueFromTest2 = await test2KVStore.get(key);
    expect(valueFromTest2).toBe(undefined);

    await test2KVStore.set(key, "test2");
    const valueFromTest1 = await test1KVStore.get(key);
    valueFromTest2 = await test2KVStore.get(key);
    expect(valueFromTest1).toBe("test1");
    expect(valueFromTest2).toBe("test2");
  });
});
