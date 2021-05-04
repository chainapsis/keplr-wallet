import { IntPretty } from "./int-pretty";
import { Int } from "./int";
import { Dec } from "./decimal";

describe("Test IntPretty", () => {
  it("Test the precision of IntPretty", () => {
    const params: {
      arg: Dec | Int;
      precision: number;
      dec: Dec;
      str: string;
    }[] = [
      {
        arg: new Int(0),
        precision: 0,
        dec: new Dec(0),
        str: "0",
      },
      {
        arg: new Dec(0),
        precision: 0,
        dec: new Dec(0),
        str: "0",
      },
      {
        arg: new Int(100),
        precision: 0,
        dec: new Dec(100),
        str: "100",
      },
      {
        arg: new Dec(100),
        precision: 0,
        dec: new Dec(100),
        str: "100",
      },
      {
        arg: new Dec("0.01"),
        precision: 2,
        dec: new Dec("0.01"),
        str: "0.01",
      },
      {
        arg: new Dec("-0.01"),
        precision: 2,
        dec: new Dec("-0.01"),
        str: "-0.01",
      },
      {
        arg: new Dec("1.01"),
        precision: 2,
        dec: new Dec("1.01"),
        str: "1.01",
      },
      {
        arg: new Dec("-1.01"),
        precision: 2,
        dec: new Dec("-1.01"),
        str: "-1.01",
      },
      {
        arg: new Dec("10.01"),
        precision: 2,
        dec: new Dec("10.01"),
        str: "10.01",
      },
      {
        arg: new Dec("-10.01"),
        precision: 2,
        dec: new Dec("-10.01"),
        str: "-10.01",
      },
      {
        arg: new Dec("10.0100"),
        precision: 2,
        dec: new Dec("10.01"),
        str: "10.01",
      },
      {
        arg: new Dec("-10.0100"),
        precision: 2,
        dec: new Dec("-10.01"),
        str: "-10.01",
      },
    ];

    for (const param of params) {
      const pretty = new IntPretty(param.arg);
      expect(pretty.options.precision).toBe(param.precision);
      expect(pretty.toDec().equals(param.dec)).toBeTruthy();
      expect(pretty.toString()).toBe(param.str);
    }
  });

  it("Test modifying the precision of IntPretty", () => {
    let pretty = new IntPretty(new Dec("10.001"));
    expect(pretty.options.precision).toBe(3);
    expect(pretty.toString()).toBe("10.001");

    let newPretty = pretty.precision(4);
    expect(newPretty.options.precision).toBe(4);
    // Max decimals not changed
    expect(newPretty.toString()).toBe("1.000");
    expect(newPretty.maxDecimals(4).toString()).toBe("1.0001");

    newPretty = pretty.increasePrecision(1);
    expect(newPretty.options.precision).toBe(4);
    expect(newPretty.toString()).toBe("1.000");
    expect(newPretty.maxDecimals(4).toString()).toBe("1.0001");

    newPretty = pretty.precision(2);
    expect(newPretty.options.precision).toBe(2);
    expect(newPretty.toString()).toBe("100.010");

    newPretty = pretty.decreasePrecision(1);
    expect(newPretty.options.precision).toBe(2);
    expect(newPretty.toString()).toBe("100.010");

    newPretty = pretty.decreasePrecision(6);
    expect(newPretty.options.precision).toBe(-3);
    expect(newPretty.toString()).toBe("10,001,000.000");

    pretty = new IntPretty(new Int(0));
    expect(pretty.decreasePrecision(3).toString()).toBe("0");
    expect(pretty.increasePrecision(3).toString()).toBe("0");

    expect(() => {
      pretty.precision(-18);
    }).not.toThrow();

    expect(() => {
      pretty.precision(18);
    }).not.toThrow();

    expect(() => {
      pretty.precision(-19);
    }).toThrow();

    expect(() => {
      pretty.precision(19);
    }).toThrow();
  });

  it("Test the add calcutation of IntPretty", () => {
    const params: {
      base: Dec | Int;
      target: Dec | Int;
      precision: number;
      dec: Dec;
      str: string;
    }[] = [
      {
        base: new Int(0),
        target: new Int(0),
        precision: 0,
        dec: new Dec(0),
        str: "0",
      },
      {
        base: new Dec(0),
        target: new Int(0),
        precision: 0,
        dec: new Dec(0),
        str: "0",
      },
      {
        base: new Int(0),
        target: new Dec(0),
        precision: 0,
        dec: new Dec(0),
        str: "0",
      },
      {
        base: new Int(1),
        target: new Dec(1),
        precision: 0,
        dec: new Dec(2),
        str: "2",
      },
      {
        base: new Int(1),
        target: new Dec(-1),
        precision: 0,
        dec: new Dec(0),
        str: "0",
      },
      {
        base: new Int(100),
        target: new Dec(-1),
        precision: 0,
        dec: new Dec("99"),
        str: "99",
      },
      {
        base: new Dec("100.001"),
        target: new Dec(-1),
        precision: 3,
        dec: new Dec("99.001"),
        str: "99.001",
      },
      {
        base: new Dec("100.00100"),
        target: new Dec("-1.001"),
        precision: 0,
        dec: new Dec("99"),
        // Max decimals should be remain
        str: "99.000",
      },
      {
        base: new Dec("100.00100"),
        target: new Dec("-0.00100"),
        precision: 0,
        dec: new Dec("100"),
        // Max decimals should be remain
        str: "100.000",
      },
      {
        base: new Dec("0.00100"),
        target: new Dec("-1.00100"),
        precision: 0,
        dec: new Dec("-1"),
        // Max decimals should be remain
        str: "-1.000",
      },
      {
        base: new Dec("100.00100"),
        target: new Dec("1.01"),
        precision: 3,
        dec: new Dec("101.011"),
        str: "101.011",
      },
    ];

    for (const param of params) {
      const pretty = new IntPretty(param.base).add(new IntPretty(param.target));
      expect(pretty.options.precision).toBe(param.precision);
      expect(pretty.toDec().equals(param.dec)).toBeTruthy();
      expect(pretty.toString()).toBe(param.str);
    }
  });

  it("Test the sub calcutation of IntPretty", () => {
    const params: {
      base: Dec | Int;
      target: Dec | Int;
      precision: number;
      dec: Dec;
      str: string;
    }[] = [
      {
        base: new Int(0),
        target: new Int(0),
        precision: 0,
        dec: new Dec(0),
        str: "0",
      },
      {
        base: new Dec(0),
        target: new Int(0),
        precision: 0,
        dec: new Dec(0),
        str: "0",
      },
      {
        base: new Int(0),
        target: new Dec(0),
        precision: 0,
        dec: new Dec(0),
        str: "0",
      },
      {
        base: new Int(1),
        target: new Dec(1),
        precision: 0,
        dec: new Dec(0),
        str: "0",
      },
      {
        base: new Int(1),
        target: new Dec(-1),
        precision: 0,
        dec: new Dec(2),
        str: "2",
      },
      {
        base: new Int(100),
        target: new Dec(-1),
        precision: 0,
        dec: new Dec("101"),
        str: "101",
      },
      {
        base: new Dec("100.001"),
        target: new Dec(-1),
        precision: 3,
        dec: new Dec("101.001"),
        str: "101.001",
      },
      {
        base: new Dec("100.00100"),
        target: new Dec("1.001"),
        precision: 0,
        dec: new Dec("99"),
        // Max decimals should be remain
        str: "99.000",
      },
      {
        base: new Dec("100.00100"),
        target: new Dec("0.00100"),
        precision: 0,
        dec: new Dec("100"),
        // Max decimals should be remain
        str: "100.000",
      },
      {
        base: new Dec("0.00100"),
        target: new Dec("-1.00100"),
        precision: 3,
        dec: new Dec("1.002"),
        str: "1.002",
      },
      {
        base: new Dec("100.00100"),
        target: new Dec("-1.01"),
        precision: 3,
        dec: new Dec("101.011"),
        str: "101.011",
      },
    ];

    for (const param of params) {
      const pretty = new IntPretty(param.base).sub(new IntPretty(param.target));
      expect(pretty.options.precision).toBe(param.precision);
      expect(pretty.toDec().equals(param.dec)).toBeTruthy();
      expect(pretty.toString()).toBe(param.str);
    }
  });

  it("Test the mul calcutation of IntPretty", () => {
    const params: {
      base: Dec | Int;
      target: Dec | Int;
      precision: number;
      dec: Dec;
      str: string;
    }[] = [
      {
        base: new Int(0),
        target: new Int(0),
        precision: 0,
        dec: new Dec(0),
        str: "0",
      },
      {
        base: new Dec(0),
        target: new Int(0),
        precision: 0,
        dec: new Dec(0),
        str: "0",
      },
      {
        base: new Int(0),
        target: new Dec(0),
        precision: 0,
        dec: new Dec(0),
        str: "0",
      },
      {
        base: new Int(1),
        target: new Dec(1),
        precision: 0,
        dec: new Dec(1),
        str: "1",
      },
      {
        base: new Int(1),
        target: new Dec(-1),
        precision: 0,
        dec: new Dec(-1),
        str: "-1",
      },
      {
        base: new Int(100),
        target: new Dec(-1),
        precision: 0,
        dec: new Dec("-100"),
        str: "-100",
      },
      {
        base: new Dec("100.001"),
        target: new Dec(-1),
        precision: 3,
        dec: new Dec("-100.001"),
        str: "-100.001",
      },
      {
        base: new Dec("100.00100"),
        target: new Dec("1.001"),
        precision: 6,
        dec: new Dec("100.101001"),
        // Max decimals should be remain
        str: "100.101",
      },
      {
        base: new Dec("100.00100"),
        target: new Dec("0.00100"),
        precision: 6,
        dec: new Dec("0.100001"),
        // Max decimals should be remain
        str: "0.100",
      },
      {
        base: new Dec("100.00100"),
        target: new Dec("-1.00100"),
        precision: 6,
        dec: new Dec("-100.101001"),
        // Max decimals should be remain
        str: "-100.101",
      },
      {
        base: new Dec("100.00100"),
        target: new Dec("-0.00100"),
        precision: 6,
        dec: new Dec("-0.100001"),
        // Max decimals should be remain
        str: "-0.100",
      },
    ];

    for (const param of params) {
      const pretty = new IntPretty(param.base).mul(new IntPretty(param.target));
      expect(pretty.options.precision).toBe(param.precision);
      expect(pretty.toDec().equals(param.dec)).toBeTruthy();
      expect(pretty.toString()).toBe(param.str);
    }
  });

  it("Test the quo calcutation of IntPretty", () => {
    expect(() => {
      new IntPretty(new Dec("1")).quo(new IntPretty(new Int(0)));
    }).toThrow();

    const params: {
      base: Dec | Int;
      target: Dec | Int;
      precision: number;
      dec: Dec;
      str: string;
    }[] = [
      {
        base: new Int(1),
        target: new Dec(1),
        precision: 0,
        dec: new Dec(1),
        str: "1",
      },
      {
        base: new Int(1),
        target: new Dec(-1),
        precision: 0,
        dec: new Dec(-1),
        str: "-1",
      },
      {
        base: new Int(100),
        target: new Dec(-1),
        precision: 0,
        dec: new Dec("-100"),
        str: "-100",
      },
      {
        base: new Dec("100.001"),
        target: new Dec(-1),
        precision: 3,
        dec: new Dec("-100.001"),
        str: "-100.001",
      },
      {
        base: new Dec("300.00300"),
        target: new Dec("3"),
        precision: 3,
        dec: new Dec("100.001"),
        str: "100.001",
      },
      {
        base: new Dec("100.00500"),
        target: new Dec("0.02"),
        precision: 2,
        dec: new Dec("5000.25"),
        // Max decimals should be remain
        str: "5,000.250",
      },
      {
        base: new Dec("300.00300"),
        target: new Dec("4"),
        precision: 5,
        dec: new Dec("75.00075"),
        // Max decimals should be remain
        str: "75.000",
      },
    ];

    for (const param of params) {
      const pretty = new IntPretty(param.base).quo(new IntPretty(param.target));
      expect(pretty.options.precision).toBe(param.precision);
      expect(pretty.toDec().equals(param.dec)).toBeTruthy();
      expect(pretty.toString()).toBe(param.str);
    }
  });

  it("Test toString() of IntPretty", () => {
    let pretty = new IntPretty(new Dec("1234.123456"));
    expect(pretty.toString()).toBe("1,234.123456");
    expect(pretty.locale(false).toString()).toBe("1234.123456");
    expect(pretty.maxDecimals(3).toString()).toBe("1,234.123");
    expect(pretty.maxDecimals(9).toString()).toBe("1,234.123456000");
    expect(pretty.maxDecimals(9).trim(true).toString()).toBe("1,234.123456");
    expect(pretty.shrink(true).toString()).toBe("1,234.123");

    pretty = new IntPretty(new Dec("0.0123456"));
    expect(pretty.toString()).toBe("0.0123456");
    expect(pretty.locale(false).toString()).toBe("0.0123456");
    expect(pretty.maxDecimals(3).toString()).toBe("0.012");
    expect(pretty.maxDecimals(9).toString()).toBe("0.012345600");
    expect(pretty.maxDecimals(9).trim(true).toString()).toBe("0.0123456");
    expect(pretty.shrink(true).toString()).toBe("0.0123456");
  });
});
