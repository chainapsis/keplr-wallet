import { mergeStores } from "./merge";

describe("Test merge stores function", () => {
  it("merge stores should merge objs from tuple of functions", () => {
    const result = mergeStores<
      {
        base: boolean;
      },
      [number, string],
      [
        {
          test1: number;
        },
        {
          test2: number;
        },
        {
          test3: string;
        }
      ]
    >(
      {
        base: true,
      },
      [3, "test"],
      (base, n) => {
        return {
          test1: base.base ? n : 0,
        };
      },
      (base) => {
        return {
          test2: base.test1 === 3 ? 4 : 0,
        };
      },
      (_base, _n, str) => {
        return {
          test3: str,
        };
      }
    );

    expect(result.test1).toBe(3);
    expect(result.test2).toBe(4);
    expect(result.test3).toBe("test");
  });
});
