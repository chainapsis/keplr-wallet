import { BinarySortArray } from "./sort";

describe("Test BinarySortArray", () => {
  test("only push sort test", async () => {
    const sort = new BinarySortArray<{
      value: number;
    }>(
      (a, b) => {
        const r = a.value - b.value;
        if (Math.abs(r) <= 0.1 + Number.EPSILON) {
          return 0;
        }
        return r;
      },
      () => {
        // noop
      },
      () => {
        // noop
      }
    );

    sort.pushAndSort("2", {
      value: 2,
    });
    expect(sort.indexOf("2")).toBe(0);
    expect(sort.arr.map((v) => v.value)).toStrictEqual([2]);

    sort.pushAndSort("2.1", {
      value: 2.1,
    });
    expect(sort.indexOf("2")).toBe(0);
    expect(sort.indexOf("2.1")).toBe(1);
    expect(sort.arr.map((v) => v.value)).toStrictEqual([2, 2.1]);

    sort.pushAndSort("1", {
      value: 1,
    });
    expect(sort.indexOf("1")).toBe(0);
    expect(sort.indexOf("2")).toBe(1);
    expect(sort.indexOf("2.1")).toBe(2);
    expect(sort.arr.map((v) => v.value)).toStrictEqual([1, 2, 2.1]);

    sort.pushAndSort("3", {
      value: 3,
    });
    expect(sort.indexOf("1")).toBe(0);
    expect(sort.indexOf("2")).toBe(1);
    expect(sort.indexOf("2.1")).toBe(2);
    expect(sort.indexOf("3")).toBe(3);
    expect(sort.arr.map((v) => v.value)).toStrictEqual([1, 2, 2.1, 3]);

    sort.pushAndSort("3.1", {
      value: 3.1,
    });
    expect(sort.indexOf("1")).toBe(0);
    expect(sort.indexOf("2")).toBe(1);
    expect(sort.indexOf("2.1")).toBe(2);
    expect(sort.indexOf("3")).toBe(3);
    expect(sort.indexOf("3.1")).toBe(4);
    expect(sort.arr.map((v) => v.value)).toStrictEqual([1, 2, 2.1, 3, 3.1]);

    sort.pushAndSort("3.05", {
      value: 3.05,
    });
    expect(sort.indexOf("1")).toBe(0);
    expect(sort.indexOf("2")).toBe(1);
    expect(sort.indexOf("2.1")).toBe(2);
    expect(sort.indexOf("3")).toBe(3);
    expect(sort.indexOf("3.1")).toBe(4);
    expect(sort.indexOf("3.05")).toBe(5);
    expect(sort.arr.map((v) => v.value)).toStrictEqual([
      1, 2, 2.1, 3, 3.1, 3.05,
    ]);

    sort.pushAndSort("2.5", {
      value: 2.5,
    });
    expect(sort.indexOf("1")).toBe(0);
    expect(sort.indexOf("2")).toBe(1);
    expect(sort.indexOf("2.1")).toBe(2);
    expect(sort.indexOf("2.5")).toBe(3);
    expect(sort.indexOf("3")).toBe(4);
    expect(sort.indexOf("3.1")).toBe(5);
    expect(sort.indexOf("3.05")).toBe(6);
    expect(sort.arr.map((v) => v.value)).toStrictEqual([
      1, 2, 2.1, 2.5, 3, 3.1, 3.05,
    ]);
  });

  test("sort existing key test", async () => {
    const sort = new BinarySortArray<{
      value: number;
    }>(
      (a, b) => {
        const r = a.value - b.value;
        if (Math.abs(r) <= 0.1 + Number.EPSILON) {
          return 0;
        }
        return r;
      },
      () => {
        // noop
      },
      () => {
        // noop
      }
    );

    sort.pushAndSort("2", {
      value: 2,
    });
    sort.pushAndSort("2.1", {
      value: 2.1,
    });
    sort.pushAndSort("1", {
      value: 1,
    });
    sort.pushAndSort("3", {
      value: 3,
    });
    sort.pushAndSort("3.1", {
      value: 3.1,
    });
    sort.pushAndSort("3.05", {
      value: 3.05,
    });
    expect(sort.indexOf("1")).toBe(0);
    expect(sort.indexOf("2")).toBe(1);
    expect(sort.indexOf("2.1")).toBe(2);
    expect(sort.indexOf("3")).toBe(3);
    expect(sort.indexOf("3.1")).toBe(4);
    expect(sort.indexOf("3.05")).toBe(5);
    expect(sort.arr.map((v) => v.value)).toStrictEqual([
      1, 2, 2.1, 3, 3.1, 3.05,
    ]);

    sort.pushAndSort("3.1", {
      value: 3.1,
    });
    expect(sort.indexOf("1")).toBe(0);
    expect(sort.indexOf("2")).toBe(1);
    expect(sort.indexOf("2.1")).toBe(2);
    expect(sort.indexOf("3")).toBe(3);
    expect(sort.indexOf("3.1")).toBe(4);
    expect(sort.indexOf("3.05")).toBe(5);
    expect(sort.arr.map((v) => v.value)).toStrictEqual([
      1, 2, 2.1, 3, 3.1, 3.05,
    ]);

    sort.pushAndSort("3.05", {
      value: 3.05,
    });
    expect(sort.indexOf("1")).toBe(0);
    expect(sort.indexOf("2")).toBe(1);
    expect(sort.indexOf("2.1")).toBe(2);
    expect(sort.indexOf("3")).toBe(3);
    expect(sort.indexOf("3.1")).toBe(4);
    expect(sort.indexOf("3.05")).toBe(5);
    expect(sort.arr.map((v) => v.value)).toStrictEqual([
      1, 2, 2.1, 3, 3.1, 3.05,
    ]);

    sort.pushAndSort("1", {
      value: 1,
    });
    expect(sort.indexOf("1")).toBe(0);
    expect(sort.indexOf("2")).toBe(1);
    expect(sort.indexOf("2.1")).toBe(2);
    expect(sort.indexOf("3")).toBe(3);
    expect(sort.indexOf("3.1")).toBe(4);
    expect(sort.indexOf("3.05")).toBe(5);
    expect(sort.arr.map((v) => v.value)).toStrictEqual([
      1, 2, 2.1, 3, 3.1, 3.05,
    ]);

    sort.pushAndSort("1", {
      value: 1.5,
    });
    expect(sort.indexOf("1")).toBe(0);
    expect(sort.indexOf("2")).toBe(1);
    expect(sort.indexOf("2.1")).toBe(2);
    expect(sort.indexOf("3")).toBe(3);
    expect(sort.indexOf("3.1")).toBe(4);
    expect(sort.indexOf("3.05")).toBe(5);
    expect(sort.arr.map((v) => v.value)).toStrictEqual([
      1.5, 2, 2.1, 3, 3.1, 3.05,
    ]);

    sort.pushAndSort("3.05", {
      value: 3,
    });
    expect(sort.indexOf("1")).toBe(0);
    expect(sort.indexOf("2")).toBe(1);
    expect(sort.indexOf("2.1")).toBe(2);
    expect(sort.indexOf("3")).toBe(3);
    expect(sort.indexOf("3.1")).toBe(4);
    expect(sort.indexOf("3.05")).toBe(5);
    expect(sort.arr.map((v) => v.value)).toStrictEqual([
      1.5, 2, 2.1, 3, 3.1, 3,
    ]);

    sort.pushAndSort("2", {
      value: 3.05,
    });
    expect(sort.indexOf("1")).toBe(0);
    expect(sort.indexOf("2.1")).toBe(1);
    expect(sort.indexOf("3")).toBe(2);
    expect(sort.indexOf("3.1")).toBe(3);
    expect(sort.indexOf("3.05")).toBe(4);
    expect(sort.indexOf("2")).toBe(5);
    expect(sort.arr.map((v) => v.value)).toStrictEqual([
      1.5, 2.1, 3, 3.1, 3, 3.05,
    ]);

    sort.pushAndSort("2", {
      value: 4,
    });
    expect(sort.indexOf("1")).toBe(0);
    expect(sort.indexOf("2.1")).toBe(1);
    expect(sort.indexOf("3")).toBe(2);
    expect(sort.indexOf("3.1")).toBe(3);
    expect(sort.indexOf("3.05")).toBe(4);
    expect(sort.indexOf("2")).toBe(5);
    expect(sort.arr.map((v) => v.value)).toStrictEqual([
      1.5, 2.1, 3, 3.1, 3, 4,
    ]);

    sort.pushAndSort("3.05", {
      value: 3.5,
    });
    expect(sort.indexOf("1")).toBe(0);
    expect(sort.indexOf("2.1")).toBe(1);
    expect(sort.indexOf("3")).toBe(2);
    expect(sort.indexOf("3.1")).toBe(3);
    expect(sort.indexOf("3.05")).toBe(4);
    expect(sort.indexOf("2")).toBe(5);
    expect(sort.arr.map((v) => v.value)).toStrictEqual([
      1.5, 2.1, 3, 3.1, 3.5, 4,
    ]);

    sort.pushAndSort("2.1", {
      value: 3.25,
    });
    expect(sort.indexOf("1")).toBe(0);
    expect(sort.indexOf("3")).toBe(1);
    expect(sort.indexOf("3.1")).toBe(2);
    expect(sort.indexOf("2.1")).toBe(3);
    expect(sort.indexOf("3.05")).toBe(4);
    expect(sort.indexOf("2")).toBe(5);
    expect(sort.arr.map((v) => v.value)).toStrictEqual([
      1.5, 3, 3.1, 3.25, 3.5, 4,
    ]);

    sort.pushAndSort("2.1", {
      value: 2.1,
    });
    expect(sort.indexOf("1")).toBe(0);
    expect(sort.indexOf("2.1")).toBe(1);
    expect(sort.indexOf("3")).toBe(2);
    expect(sort.indexOf("3.1")).toBe(3);
    expect(sort.indexOf("3.05")).toBe(4);
    expect(sort.indexOf("2")).toBe(5);
    expect(sort.arr.map((v) => v.value)).toStrictEqual([
      1.5, 2.1, 3, 3.1, 3.5, 4,
    ]);

    sort.pushAndSort("1", {
      value: 5,
    });
    expect(sort.indexOf("2.1")).toBe(0);
    expect(sort.indexOf("3")).toBe(1);
    expect(sort.indexOf("3.1")).toBe(2);
    expect(sort.indexOf("3.05")).toBe(3);
    expect(sort.indexOf("2")).toBe(4);
    expect(sort.indexOf("1")).toBe(5);
    expect(sort.arr.map((v) => v.value)).toStrictEqual([
      2.1, 3, 3.1, 3.5, 4, 5,
    ]);
  });

  test("sort removing test", async () => {
    const sort = new BinarySortArray<{
      value: number;
    }>(
      (a, b) => {
        const r = a.value - b.value;
        if (Math.abs(r) <= 0.1 + Number.EPSILON) {
          return 0;
        }
        return r;
      },
      () => {
        // noop
      },
      () => {
        // noop
      }
    );

    sort.pushAndSort("2", {
      value: 2,
    });
    sort.pushAndSort("2.1", {
      value: 2.1,
    });
    sort.pushAndSort("1", {
      value: 1,
    });
    sort.pushAndSort("3", {
      value: 3,
    });
    sort.pushAndSort("3.1", {
      value: 3.1,
    });
    sort.pushAndSort("3.05", {
      value: 3.05,
    });
    expect(sort.indexOf("1")).toBe(0);
    expect(sort.indexOf("2")).toBe(1);
    expect(sort.indexOf("2.1")).toBe(2);
    expect(sort.indexOf("3")).toBe(3);
    expect(sort.indexOf("3.1")).toBe(4);
    expect(sort.indexOf("3.05")).toBe(5);
    expect(sort.arr.map((v) => v.value)).toStrictEqual([
      1, 2, 2.1, 3, 3.1, 3.05,
    ]);

    expect(sort.remove("2.1")).toBe(true);
    expect(sort.indexOf("1")).toBe(0);
    expect(sort.indexOf("2")).toBe(1);
    expect(sort.indexOf("3")).toBe(2);
    expect(sort.indexOf("3.1")).toBe(3);
    expect(sort.indexOf("3.05")).toBe(4);
    expect(sort.arr.map((v) => v.value)).toStrictEqual([1, 2, 3, 3.1, 3.05]);

    expect(sort.remove("1")).toBe(true);
    expect(sort.indexOf("2")).toBe(0);
    expect(sort.indexOf("3")).toBe(1);
    expect(sort.indexOf("3.1")).toBe(2);
    expect(sort.indexOf("3.05")).toBe(3);
    expect(sort.arr.map((v) => v.value)).toStrictEqual([2, 3, 3.1, 3.05]);

    expect(sort.remove("3")).toBe(true);
    expect(sort.indexOf("2")).toBe(0);
    expect(sort.indexOf("3.1")).toBe(1);
    expect(sort.indexOf("3.05")).toBe(2);
    expect(sort.arr.map((v) => v.value)).toStrictEqual([2, 3.1, 3.05]);

    expect(sort.remove("3.05")).toBe(true);
    expect(sort.indexOf("2")).toBe(0);
    expect(sort.indexOf("3.1")).toBe(1);
    expect(sort.arr.map((v) => v.value)).toStrictEqual([2, 3.1]);

    expect(sort.remove("2")).toBe(true);
    expect(sort.indexOf("3.1")).toBe(0);
    expect(sort.arr.map((v) => v.value)).toStrictEqual([3.1]);

    expect(sort.remove("3.1")).toBe(true);
    expect(sort.arr.map((v) => v.value)).toStrictEqual([]);
  });
});
