import assert from "assert";
import "mocha";

import { AsyncMutex } from "./index";

describe("Test async mutex", () => {
  it("It should be unlocked after unlocking", async () => {
    const mutex = new AsyncMutex();
    const testIsLockedFn = () => {
      assert.strictEqual(mutex.isLocked, true);
      mutex.unlock();
      assert.strictEqual(mutex.isLocked, false);
    };
    setTimeout(testIsLockedFn, 100);
    await mutex.lock();
  });

  it("It should be unlocked when unlock occurs as much as lock", async () => {
    const mutex = new AsyncMutex();
    const testUnlockFn = () => {
      assert.strictEqual(mutex.isLocked, true);
      mutex.unlock();
      assert.strictEqual(mutex.isLocked, true);
    };
    setTimeout(testUnlockFn, 100);
    await mutex.lock();
    await mutex.lock();
    assert.strictEqual(mutex.isLocked, true);
    await mutex.unlock();
    assert.strictEqual(mutex.isLocked, false);
    // If mutex is not unlocked properly, testing will throw a timeout error.
  });
});
