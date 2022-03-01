import { Int, Uint } from "./int";
import { Dec } from "./decimal";

describe("Test Int/Uint", () => {
  // (2 ** 256) - 1
  const maxInt =
    "115792089237316195423570985008687907853269984665640564039457584007913129639935";
  // 2 ** 256
  const overflowedInt =
    "115792089237316195423570985008687907853269984665640564039457584007913129639936";

  it("Test parsing Int", () => {
    expect(new Int(0).toString()).toBe("0");
    expect(new Int(-0).toString()).toBe("0");
    expect(new Int(1).toString()).toBe("1");
    expect(new Int(-1).toString()).toBe("-1");
    expect(new Int("-123").toString()).toBe("-123");

    expect(new Int(maxInt).toString()).toBe(maxInt);
    expect(new Int("-" + maxInt).toString()).toBe("-" + maxInt);

    expect(() => new Int("1.1")).toThrow();
    expect(() => new Int("1.0")).toThrow();
    expect(() => new Int(1.1)).toThrow();
    expect(() => new Int("-1.1")).toThrow();

    expect(() => new Int("str")).toThrow();
  });

  it("Test Int/Uint toDec", () => {
    expect(new Int(0).toDec().toString()).toBe(new Dec(0).toString());
    expect(new Uint(0).toDec().toString()).toBe(new Dec(0).toString());

    expect(new Int(123).toDec().toString()).toBe(new Dec(123).toString());
    expect(new Uint(123).toDec().toString()).toBe(new Dec(123).toString());

    expect(new Int(-123).toDec().toString()).toBe(new Dec(-123).toString());
  });

  it("Test Int/Uint overflow", () => {
    expect(() => new Int(overflowedInt)).toThrow();
    expect(() => new Int("-" + overflowedInt)).toThrow();

    const max = new Int(maxInt);
    expect(() => max.add(new Int(1))).toThrow();
    const min = new Int("-" + maxInt);
    expect(() => min.sub(new Int(1))).toThrow();

    expect(() => new Uint(overflowedInt)).toThrow();
    const uMax = new Uint(maxInt);
    expect(() => uMax.add(new Uint(1))).toThrow();
  });

  it("Test parsing UInt", () => {
    expect(new Uint(0).toString()).toBe("0");
    expect(new Uint(-0).toString()).toBe("0");
    expect(new Uint(1).toString()).toBe("1");

    expect(new Uint(maxInt).toString()).toBe(maxInt);

    expect(() => new Uint("1.1")).toThrow();
    expect(() => new Uint("1.0")).toThrow();
    expect(() => new Uint(1.1)).toThrow();
    expect(() => new Uint("-1.1")).toThrow();

    expect(() => new Uint("str")).toThrow();
  });

  it("Test UInt overflow", () => {
    expect(() => new Int(overflowedInt)).toThrow();

    const max = new Int(maxInt);
    expect(() => max.add(new Int(1))).toThrow();
  });

  it("Test Uint can not be negative", () => {
    expect(() => new Uint(-1)).toThrow();
    expect(() => new Uint("-123")).toThrow();

    const uint = new Uint(0);
    expect(() => uint.sub(new Uint(1))).toThrow();
  });

  it("Test Int isNegative/isPositive/isZero", () => {
    expect(new Int(1).isPositive()).toBe(true);
    expect(new Int(1).isNegative()).toBe(false);

    expect(new Int(-1).isPositive()).toBe(false);
    expect(new Int(-1).isNegative()).toBe(true);

    expect(new Int(0).isZero()).toBe(true);
    expect(new Int(1).isZero()).toBe(false);
    expect(new Int(-1).isZero()).toBe(false);
  });

  it("Test Uint isZero", () => {
    expect(new Uint(0).isZero()).toBe(true);
    expect(new Uint(1).isZero()).toBe(false);
  });

  it("Test Int computation", () => {
    const int1 = new Int(1);
    const int2 = new Int(2);
    const int3 = new Int(3);

    expect(int1.add(int2).toString()).toBe("3");

    expect(int1.sub(int2).toString()).toBe("-1");
    expect(int2.sub(int1).toString()).toBe("1");

    expect(int1.mul(int2).toString()).toBe("2");

    expect(int1.div(int2).toString()).toBe("0");
    expect(int2.div(int1).toString()).toBe("2");
    expect(int3.div(int2).toString()).toBe("1");

    expect(int1.mod(int2).toString()).toBe("1");
    expect(int2.mod(int1).toString()).toBe("0");
    expect(int3.mod(int2).toString()).toBe("1");

    expect(int1.neg().toString()).toBe("-1");
    expect(int1.neg().abs().toString()).toBe("1");
    expect(int1.neg().absUInt().toString()).toBe("1");

    expect(int1.pow(int3.absUInt()).toString()).toBe("1");
    expect(int2.pow(int3.absUInt()).toString()).toBe("8");
  });

  it("Test Uint computation", () => {
    const int1 = new Uint(1);
    const int2 = new Uint(2);
    const int3 = new Uint(3);

    expect(int1.add(int2).toString()).toBe("3");

    expect(() => int1.sub(int2).toString()).toThrow();
    expect(int2.sub(int1).toString()).toBe("1");

    expect(int1.mul(int2).toString()).toBe("2");

    expect(int1.div(int2).toString()).toBe("0");
    expect(int2.div(int1).toString()).toBe("2");
    expect(int3.div(int2).toString()).toBe("1");

    expect(int1.mod(int2).toString()).toBe("1");
    expect(int2.mod(int1).toString()).toBe("0");
    expect(int3.mod(int2).toString()).toBe("1");

    expect(int1.pow(int3).toString()).toBe("1");
    expect(int2.pow(int3).toString()).toBe("8");
  });

  it("Test Int/Uint comparison", () => {
    const int1 = new Int(1);
    const int2 = new Int(2);

    expect(int1.gt(int2)).toBe(false);
    expect(int1.gte(int1)).toBe(true);

    expect(int1.lt(int2)).toBe(true);
    expect(int1.lte(int1)).toBe(true);

    expect(int1.equals(int2)).toBe(false);
    expect(int1.equals(int1)).toBe(true);

    const uint1 = new Uint(1);
    const uint2 = new Uint(2);

    expect(uint1.gt(uint2)).toBe(false);
    expect(uint1.gte(uint1)).toBe(true);

    expect(uint1.lt(uint2)).toBe(true);
    expect(uint1.lte(uint1)).toBe(true);

    expect(uint1.equals(uint2)).toBe(false);
    expect(uint1.equals(uint1)).toBe(true);
  });

  it("Test Int/Uint from exponent number", () => {
    const tests: {
      num: number;
      str: string;
      expect: Int | Uint;
    }[] = [
      {
        num: 12345678901234567890123,
        str: "1.2345678901234568e+22",
        expect: new Int("12345678901234568000000"),
      },
      {
        num: -12345678901234567890123,
        str: "-1.2345678901234568e+22",
        expect: new Int("-12345678901234568000000"),
      },
      {
        num: 12345678901234567890123,
        str: "1.2345678901234568e+22",
        expect: new Uint("12345678901234568000000"),
      },
    ];

    for (const test of tests) {
      expect(test.num.toString()).toBe(test.str);

      if (test.expect instanceof Int) {
        expect(new Int(test.num).equals(test.expect)).toBe(true);
      } else {
        expect(new Uint(test.num).equals(test.expect)).toBe(true);
      }
    }
  });
});
