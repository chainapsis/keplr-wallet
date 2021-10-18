import { Debouncer } from "./debouncer";

describe("Test common utils", () => {
  test("Test debouncer", async () => {
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
    expect(r1).toBe(1);
    expect(r2).toBe(2);
    expect(r3).toBe(3);

    const debouncedFn = Debouncer.promise(fn);
    // debounced fn should return the same results.
    [r1, r2, r3] = await Promise.all([
      debouncedFn(),
      debouncedFn(),
      debouncedFn(),
    ]);
    expect(r1).toBe(4);
    expect(r2).toBe(4);
    expect(r3).toBe(4);
  });
});
