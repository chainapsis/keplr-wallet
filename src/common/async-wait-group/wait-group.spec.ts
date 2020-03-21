import assert from "assert";
import "mocha";

import { AsyncWaitGroup } from "./index";

describe("Test async wait group", () => {
  it("It should be unlocked after done", async () => {
    const waitGroup = new AsyncWaitGroup();

    const testIsLockedFn = () => {
      assert.strictEqual(waitGroup.isLocked, true);
      waitGroup.done();
      assert.strictEqual(waitGroup.isLocked, false);
    };
    setTimeout(testIsLockedFn, 100);

    waitGroup.add();
    assert.strictEqual(waitGroup.isLocked, true);

    await waitGroup.wait();
    assert.strictEqual(waitGroup.isLocked, false);
    // If wait group is not unlocked properly, testing will throw a timeout error.
  });

  it("It should be unlocked when done occurs as much as adding count", async () => {
    const waitGroup = new AsyncWaitGroup();

    const testUnlockFn = () => {
      assert.strictEqual(waitGroup.isLocked, true);
      waitGroup.done();
      assert.strictEqual(waitGroup.isLocked, true);
      waitGroup.done();
      assert.strictEqual(waitGroup.isLocked, false);
    };
    setTimeout(testUnlockFn, 100);

    assert.strictEqual(waitGroup.isLocked, false);
    waitGroup.add();
    assert.strictEqual(waitGroup.isLocked, true);
    waitGroup.add();
    assert.strictEqual(waitGroup.isLocked, true);

    await waitGroup.wait();
    assert.strictEqual(waitGroup.isLocked, false);
    // If wait group is not unlocked properly, testing will throw a timeout error.
  });
});
