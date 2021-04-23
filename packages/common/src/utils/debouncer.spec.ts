import assert from "assert";
import "mocha";
import { Debouncer } from "./debouncer";

describe("Test common utils", () => {
  it("Test debouncer", async () => {
    let i = 0;
    const fn = (): Promise<number> => {
      i++;
      return ((i: number) =>
        new Promise<number>((resolve) => {
          setTimeout(() => {
            resolve(i);
          }, 500);
        }))(i);
    };

    // Non debounced fn should return the different results.
    let [r1, r2, r3] = await Promise.all([fn(), fn(), fn()]);
    assert.strictEqual(r1, 1);
    assert.strictEqual(r2, 2);
    assert.strictEqual(r3, 3);

    const debouncedFn = Debouncer.promise(fn);
    // debounced fn should return the same results.
    [r1, r2, r3] = await Promise.all([
      debouncedFn(),
      debouncedFn(),
      debouncedFn(),
    ]);
    assert.strictEqual(r1, 4);
    assert.strictEqual(r2, 4);
    assert.strictEqual(r3, 4);
  });
});
