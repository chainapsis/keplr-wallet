import { IntPretty } from "./int-pretty";
import { Int } from "./int";
import { Dec } from "./decimal";

describe("Test IntPretty", () => {
  it("Test creation of IntPretty", () => {
    expect(new IntPretty(new Dec("1.1")).toDec().equals(new Dec("1.1"))).toBe(
      true
    );
    expect(new IntPretty(new Dec("1.1")).maxDecimals(2).toString()).toBe(
      "1.10"
    );

    expect(new IntPretty("1.1").toDec().equals(new Dec("1.1"))).toBe(true);
    expect(new IntPretty("1.1").maxDecimals(2).toString()).toBe("1.10");

    expect(new IntPretty(1.1).toDec().equals(new Dec("1.1"))).toBe(true);
    expect(new IntPretty(1.1).maxDecimals(2).toString()).toBe("1.10");

    expect(new IntPretty(new Int(1)).toDec().equals(new Dec("1.0"))).toBe(true);
    expect(new IntPretty(new Int(1)).maxDecimals(2).toString()).toBe("1.00");
  });

  it("Test the maxDecimals of IntPretty", () => {
    const params: {
      arg: Dec | Int;
      maxDecimals: number;
      dec: Dec;
      str: string;
    }[] = [
      {
        arg: new Int(0),
        maxDecimals: 0,
        dec: new Dec(0),
        str: "0",
      },
      {
        arg: new Dec(0),
        maxDecimals: 0,
        dec: new Dec(0),
        str: "0",
      },
      {
        arg: new Int(100),
        maxDecimals: 0,
        dec: new Dec(100),
        str: "100",
      },
      {
        arg: new Dec(100),
        maxDecimals: 0,
        dec: new Dec(100),
        str: "100",
      },
      {
        arg: new Dec("0.01"),
        maxDecimals: 2,
        dec: new Dec("0.01"),
        str: "0.01",
      },
      {
        arg: new Dec("-0.01"),
        maxDecimals: 2,
        dec: new Dec("-0.01"),
        str: "-0.01",
      },
      {
        arg: new Dec("1.01"),
        maxDecimals: 2,
        dec: new Dec("1.01"),
        str: "1.01",
      },
      {
        arg: new Dec("-1.01"),
        maxDecimals: 2,
        dec: new Dec("-1.01"),
        str: "-1.01",
      },
      {
        arg: new Dec("10.01"),
        maxDecimals: 2,
        dec: new Dec("10.01"),
        str: "10.01",
      },
      {
        arg: new Dec("-10.01"),
        maxDecimals: 2,
        dec: new Dec("-10.01"),
        str: "-10.01",
      },
      {
        arg: new Dec("10.0100"),
        maxDecimals: 2,
        dec: new Dec("10.01"),
        str: "10.01",
      },
      {
        arg: new Dec("-10.0100"),
        maxDecimals: 2,
        dec: new Dec("-10.01"),
        str: "-10.01",
      },
    ];

    for (const param of params) {
      const pretty = new IntPretty(param.arg);
      expect(pretty.options.maxDecimals).toBe(param.maxDecimals);
      expect(pretty.toDec().equals(param.dec)).toBeTruthy();
      expect(pretty.toString()).toBe(param.str);
    }
  });

  it("Test modifying the precision of IntPretty", () => {
    const tests: {
      base: Dec;
      delta: number;
      right: boolean;
      res: Dec;
      resStr: string;
      otherTest?: (int: IntPretty) => void;
    }[] = [
      {
        base: new Dec("10.001"),
        delta: 0,
        right: false,
        res: new Dec("10.001"),
        resStr: "10.001",
        otherTest: (int) => {
          expect(int.maxDecimals(4).toString()).toBe("10.0010");
        },
      },
      {
        base: new Dec("10.001"),
        delta: 1,
        right: false,
        res: new Dec("1.0001"),
        resStr: "1.000",
        otherTest: (int) => {
          expect(int.maxDecimals(4).toString()).toBe("1.0001");
        },
      },
      {
        base: new Dec("10.001"),
        delta: 1,
        right: true,
        res: new Dec("100.010"),
        resStr: "100.010",
        otherTest: (int) => {
          expect(int.maxDecimals(4).toString()).toBe("100.0100");
        },
      },
      {
        base: new Dec("10.001"),
        delta: 6,
        right: true,
        res: new Dec("10001000"),
        resStr: "10,001,000.000",
      },
      {
        base: new Dec("0"),
        delta: 3,
        right: false,
        res: new Dec("0"),
        resStr: "0",
      },
      {
        base: new Dec("0"),
        delta: 3,
        right: true,
        res: new Dec("0"),
        resStr: "0",
      },
      {
        base: new Dec("100.01"),
        delta: 20,
        right: true,
        res: new Dec("10001000000000000000000"),
        resStr: "10,001,000,000,000,000,000,000.00",
      },
      {
        base: new Dec("100.01"),
        delta: 20,
        right: false,
        res: new Dec("0.000000000000000001"),
        resStr: "0.00",
        otherTest: (int) => {
          expect(int.trim(true).toString()).toBe("0");
        },
      },
    ];

    for (const test of tests) {
      let pretty = new IntPretty(test.base);

      if (test.right) {
        pretty = pretty.moveDecimalPointRight(test.delta);
      } else {
        pretty = pretty.moveDecimalPointLeft(test.delta);
      }

      expect(pretty.toDec().equals(test.res)).toBeTruthy();
      expect(pretty.toString()).toBe(test.resStr);

      if (test.otherTest) {
        test.otherTest(pretty);
      }
    }

    for (const test of tests) {
      let pretty = new IntPretty(test.base);

      if (test.right) {
        pretty = pretty.decreasePrecision(test.delta);
      } else {
        pretty = pretty.increasePrecision(test.delta);
      }

      expect(pretty.toDec().equals(test.res)).toBeTruthy();
      expect(pretty.toString()).toBe(test.resStr);

      if (test.otherTest) {
        test.otherTest(pretty);
      }
    }
  });

  it("Test the add calcutation of IntPretty", () => {
    const params: {
      base: Dec | Int;
      target: Dec | Int;
      dec: Dec;
      str: string;
    }[] = [
      {
        base: new Int(0),
        target: new Int(0),
        dec: new Dec(0),
        str: "0",
      },
      {
        base: new Dec(0),
        target: new Int(0),
        dec: new Dec(0),
        str: "0",
      },
      {
        base: new Int(0),
        target: new Dec(0),
        dec: new Dec(0),
        str: "0",
      },
      {
        base: new Int(1),
        target: new Dec(1),
        dec: new Dec(2),
        str: "2",
      },
      {
        base: new Int(1),
        target: new Dec(-1),
        dec: new Dec(0),
        str: "0",
      },
      {
        base: new Int(100),
        target: new Dec(-1),
        dec: new Dec("99"),
        str: "99",
      },
      {
        base: new Dec("100.001"),
        target: new Dec(-1),
        dec: new Dec("99.001"),
        str: "99.001",
      },
      {
        base: new Dec("100.00100"),
        target: new Dec("-1.001"),
        dec: new Dec("99"),
        // Max decimals should be remain
        str: "99.000",
      },
      {
        base: new Dec("100.00100"),
        target: new Dec("-0.00100"),
        dec: new Dec("100"),
        // Max decimals should be remain
        str: "100.000",
      },
      {
        base: new Dec("0.00100"),
        target: new Dec("-1.00100"),
        dec: new Dec("-1"),
        // Max decimals should be remain
        str: "-1.000",
      },
      {
        base: new Dec("100.00100"),
        target: new Dec("1.01"),
        dec: new Dec("101.011"),
        str: "101.011",
      },
    ];

    for (const param of params) {
      const pretty = new IntPretty(param.base).add(new IntPretty(param.target));
      expect(pretty.toDec().equals(param.dec)).toBeTruthy();
      expect(pretty.toString()).toBe(param.str);
    }
  });

  it("Test the sub calcutation of IntPretty", () => {
    const params: {
      base: Dec | Int;
      target: Dec | Int;
      dec: Dec;
      str: string;
    }[] = [
      {
        base: new Int(0),
        target: new Int(0),
        dec: new Dec(0),
        str: "0",
      },
      {
        base: new Dec(0),
        target: new Int(0),
        dec: new Dec(0),
        str: "0",
      },
      {
        base: new Int(0),
        target: new Dec(0),
        dec: new Dec(0),
        str: "0",
      },
      {
        base: new Int(1),
        target: new Dec(1),
        dec: new Dec(0),
        str: "0",
      },
      {
        base: new Int(1),
        target: new Dec(-1),
        dec: new Dec(2),
        str: "2",
      },
      {
        base: new Int(100),
        target: new Dec(-1),
        dec: new Dec("101"),
        str: "101",
      },
      {
        base: new Dec("100.001"),
        target: new Dec(-1),
        dec: new Dec("101.001"),
        str: "101.001",
      },
      {
        base: new Dec("100.00100"),
        target: new Dec("1.001"),
        dec: new Dec("99"),
        // Max decimals should be remain
        str: "99.000",
      },
      {
        base: new Dec("100.00100"),
        target: new Dec("0.00100"),
        dec: new Dec("100"),
        // Max decimals should be remain
        str: "100.000",
      },
      {
        base: new Dec("0.00100"),
        target: new Dec("-1.00100"),
        dec: new Dec("1.002"),
        str: "1.002",
      },
      {
        base: new Dec("100.00100"),
        target: new Dec("-1.01"),
        dec: new Dec("101.011"),
        str: "101.011",
      },
    ];

    for (const param of params) {
      const pretty = new IntPretty(param.base).sub(new IntPretty(param.target));
      expect(pretty.toDec().equals(param.dec)).toBeTruthy();
      expect(pretty.toString()).toBe(param.str);
    }
  });

  it("Test the mul calcutation of IntPretty", () => {
    const params: {
      base: Dec | Int;
      target: Dec | Int;
      dec: Dec;
      str: string;
    }[] = [
      {
        base: new Int(0),
        target: new Int(0),
        dec: new Dec(0),
        str: "0",
      },
      {
        base: new Dec(0),
        target: new Int(0),
        dec: new Dec(0),
        str: "0",
      },
      {
        base: new Int(0),
        target: new Dec(0),
        dec: new Dec(0),
        str: "0",
      },
      {
        base: new Int(1),
        target: new Dec(1),
        dec: new Dec(1),
        str: "1",
      },
      {
        base: new Int(1),
        target: new Dec(-1),
        dec: new Dec(-1),
        str: "-1",
      },
      {
        base: new Int(100),
        target: new Dec(-1),
        dec: new Dec("-100"),
        str: "-100",
      },
      {
        base: new Dec("100.001"),
        target: new Dec(-1),
        dec: new Dec("-100.001"),
        str: "-100.001",
      },
      {
        base: new Dec("100.00100"),
        target: new Dec("1.001"),
        dec: new Dec("100.101001"),
        // Max decimals should be remain
        str: "100.101",
      },
      {
        base: new Dec("100.00100"),
        target: new Dec("0.00100"),
        dec: new Dec("0.100001"),
        // Max decimals should be remain
        str: "0.100",
      },
      {
        base: new Dec("100.00100"),
        target: new Dec("-1.00100"),
        dec: new Dec("-100.101001"),
        // Max decimals should be remain
        str: "-100.101",
      },
      {
        base: new Dec("100.00100"),
        target: new Dec("-0.00100"),
        dec: new Dec("-0.100001"),
        // Max decimals should be remain
        str: "-0.100",
      },
    ];

    for (const param of params) {
      const pretty = new IntPretty(param.base).mul(new IntPretty(param.target));
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
      dec: Dec;
      str: string;
    }[] = [
      {
        base: new Int(1),
        target: new Dec(1),
        dec: new Dec(1),
        str: "1",
      },
      {
        base: new Int(1),
        target: new Dec(-1),
        dec: new Dec(-1),
        str: "-1",
      },
      {
        base: new Int(100),
        target: new Dec(-1),
        dec: new Dec("-100"),
        str: "-100",
      },
      {
        base: new Dec("100.001"),
        target: new Dec(-1),
        dec: new Dec("-100.001"),
        str: "-100.001",
      },
      {
        base: new Dec("300.00300"),
        target: new Dec("3"),
        dec: new Dec("100.001"),
        str: "100.001",
      },
      {
        base: new Dec("100.00500"),
        target: new Dec("0.02"),
        dec: new Dec("5000.25"),
        // Max decimals should be remain
        str: "5,000.250",
      },
      {
        base: new Dec("300.00300"),
        target: new Dec("4"),
        dec: new Dec("75.00075"),
        // Max decimals should be remain
        str: "75.000",
      },
    ];

    for (const param of params) {
      const pretty = new IntPretty(param.base).quo(new IntPretty(param.target));
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

  it("Test inequalitySymbol of IntPretty", () => {
    const tests: {
      base: IntPretty;
      maxDecimals: number;
      inequalitySymbolSeparator: string;
      resStr: string;
    }[] = [
      {
        base: new IntPretty(new Dec("0")),
        maxDecimals: 3,
        inequalitySymbolSeparator: " ",
        resStr: "0.000",
      },
      {
        base: new IntPretty(new Dec("-0")),
        maxDecimals: 3,
        inequalitySymbolSeparator: " ",
        resStr: "0.000",
      },
      {
        base: new IntPretty(new Dec("0.1")),
        maxDecimals: 3,
        inequalitySymbolSeparator: " ",
        resStr: "0.100",
      },
      {
        base: new IntPretty(new Dec("1234.123456")),
        maxDecimals: 3,
        inequalitySymbolSeparator: " ",
        resStr: "1,234.123",
      },
      {
        base: new IntPretty(new Dec("0.123456")),
        maxDecimals: 3,
        inequalitySymbolSeparator: " ",
        resStr: "0.123",
      },
      {
        base: new IntPretty(new Dec("0.123456")).moveDecimalPointLeft(2),
        maxDecimals: 3,
        inequalitySymbolSeparator: " ",
        resStr: "0.001",
      },
      {
        base: new IntPretty(new Dec("0.123456")).moveDecimalPointLeft(3),
        maxDecimals: 3,
        inequalitySymbolSeparator: " ",
        resStr: "< 0.001",
      },
      {
        base: new IntPretty(new Dec("0.123456")),
        maxDecimals: 0,
        inequalitySymbolSeparator: " ",
        resStr: "< 1",
      },
      {
        base: new IntPretty(new Dec("1.123456")),
        maxDecimals: 0,
        inequalitySymbolSeparator: " ",
        resStr: "1",
      },
      {
        base: new IntPretty(new Dec("0.0001")),
        maxDecimals: 3,
        inequalitySymbolSeparator: " ",
        resStr: "< 0.001",
      },
      {
        base: new IntPretty(new Dec("0.0001")),
        maxDecimals: 3,
        inequalitySymbolSeparator: "",
        resStr: "<0.001",
      },
      {
        base: new IntPretty(new Dec("0.001")),
        maxDecimals: 3,
        inequalitySymbolSeparator: " ",
        resStr: "0.001",
      },
      {
        base: new IntPretty(new Dec("-1234.123456")),
        maxDecimals: 3,
        inequalitySymbolSeparator: " ",
        resStr: "-1,234.123",
      },
      {
        base: new IntPretty(new Dec("-0.123456")),
        maxDecimals: 3,
        inequalitySymbolSeparator: " ",
        resStr: "-0.123",
      },
      {
        base: new IntPretty(new Dec("-0.0001")),
        maxDecimals: 3,
        inequalitySymbolSeparator: " ",
        resStr: "> -0.001",
      },
      {
        base: new IntPretty(new Dec("-0.0001")),
        maxDecimals: 3,
        inequalitySymbolSeparator: "",
        resStr: ">-0.001",
      },
      {
        base: new IntPretty(new Dec("-0.001")),
        maxDecimals: 3,
        inequalitySymbolSeparator: " ",
        resStr: "-0.001",
      },
      {
        base: new IntPretty(new Dec("-0.123456")),
        maxDecimals: 0,
        inequalitySymbolSeparator: " ",
        resStr: "> -1",
      },
      {
        base: new IntPretty(new Dec("-1.123456")),
        maxDecimals: 0,
        inequalitySymbolSeparator: " ",
        resStr: "-1",
      },
    ];

    for (const test of tests) {
      expect(
        test.base
          .maxDecimals(test.maxDecimals)
          .inequalitySymbol(true)
          .inequalitySymbolSeparator(test.inequalitySymbolSeparator)
          .toString()
      ).toBe(test.resStr);
    }
  });

  it("Test toStringWithSymbols() of IntPretty", () => {
    expect(
      new IntPretty(new Dec(-123.45)).toStringWithSymbols("$", "SUFFIX")
    ).toBe("-$123.45SUFFIX");

    expect(
      new IntPretty(new Dec(-123.45))
        .maxDecimals(0)
        .toStringWithSymbols("$", "SUFFIX")
    ).toBe("-$123SUFFIX");

    expect(
      new IntPretty(new Dec(-0.045))
        .maxDecimals(1)
        .inequalitySymbol(true)
        .toStringWithSymbols("$", "SUFFIX")
    ).toBe("> -$0.1SUFFIX");

    expect(
      new IntPretty(new Dec(0.045))
        .maxDecimals(1)
        .inequalitySymbol(true)
        .toStringWithSymbols("$", "SUFFIX")
    ).toBe("< $0.1SUFFIX");
  });
});
