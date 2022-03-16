import { mergeStores } from "./merge";

describe("Test merge stores function", () => {
  it("merge stores should merge objs from tuple of functions", () => {
    const result = mergeStores<
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
      [1, "test"],
      (n) => {
        return {
          test1: n,
        };
      },
      () => {
        return {
          test2: 2,
        };
      },
      (_, str) => {
        return {
          test3: str,
        };
      }
    );

    expect(result.test1).toBe(1);
    expect(result.test2).toBe(2);
    expect(result.test3).toBe("test");
  });
});
