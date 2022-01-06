import { Dec } from "./decimal";
import { Int } from "./int";

describe("Test decimals", () => {
  // (2 ** (256 + 60) - 1) / (10 ** 18)
  const maxDec =
    "133499189745056880149688856635597007162669032647290798121690100488888732861290.034376435130433535";
  // maxDec + 0.000000000000000001
  const overflowedDec =
    "133499189745056880149688856635597007162669032647290798121690100488888732861290.034376435130433536";

  it("dec should be parsed properly", () => {
    expect(() => new Dec(1, 0)).not.toThrow();
    expect(() => new Dec(1, -1)).toThrow();
    expect(() => new Dec(1, Dec.precision)).not.toThrow();
    expect(() => new Dec(1, Dec.precision + 1)).toThrow();

    let dec = new Dec("10.009");
    expect(dec.toString()).toBe("10.009000000000000000");
    expect(dec.toString(2)).toBe("10.00");

    dec = new Dec("-123.45678900");
    expect(dec.toString()).toBe("-123.456789000000000000");
    expect(dec.toString(3)).toBe("-123.456");

    dec = new Dec("10");
    expect(dec.toString()).toBe("10.000000000000000000");

    dec = new Dec(10);
    expect(dec.toString()).toBe("10.000000000000000000");

    dec = new Dec(10.009);
    expect(dec.toString()).toBe("10.009000000000000000");
    expect(dec.toString(2)).toBe("10.00");

    dec = new Dec(-123.456789);
    expect(dec.toString()).toBe("-123.456789000000000000");
    expect(dec.toString(3)).toBe("-123.456");

    expect(() => {
      new Dec("");
    }).toThrow();
    expect(() => {
      new Dec("0.-75");
    }).toThrow();
    expect(() => {
      new Dec("0.489234893284938249348923849283408");
    }).not.toThrow();
    expect(() => {
      new Dec("foobar");
    }).toThrow();
    expect(() => {
      new Dec("0.foobar");
    }).toThrow();
    expect(() => {
      new Dec("foobar.0");
    }).toThrow();
  });

  it("Test Dec overflow", () => {
    expect(new Dec(maxDec).toString()).toBe(maxDec);
    expect(new Dec("-" + maxDec).toString()).toBe("-" + maxDec);

    expect(() => new Dec(overflowedDec)).toThrow();
    expect(() => new Dec("-" + overflowedDec)).toThrow();

    const max = new Dec(maxDec);
    expect(() => max.add(new Dec(1, Dec.precision))).toThrow();

    const min = new Dec("-" + maxDec);
    expect(() => min.sub(new Dec(1, Dec.precision))).toThrow();
  });

  it("Test Dec neg/abs", () => {
    expect(new Dec(1).neg().toString()).toBe("-1.000000000000000000");
    expect(new Dec(1).neg().equals(new Dec(-1))).toBe(true);

    expect(new Dec(-1).neg().toString()).toBe("1.000000000000000000");
    expect(new Dec(-1).neg().equals(new Dec(1))).toBe(true);

    expect(new Dec(1).abs().toString()).toBe("1.000000000000000000");
    expect(new Dec(1).abs().equals(new Dec(1))).toBe(true);

    expect(new Dec(-1).abs().toString()).toBe("1.000000000000000000");
    expect(new Dec(-1).abs().equals(new Dec(1))).toBe(true);
  });

  it("Test Dec isPositive/isNegative/isInteger/isZero", () => {
    expect(new Dec(1).isPositive()).toBe(true);
    expect(new Dec(-1).isPositive()).toBe(false);

    expect(new Dec(1).isNegative()).toBe(false);
    expect(new Dec(-1).isNegative()).toBe(true);

    expect(new Dec(1).isInteger()).toBe(true);
    expect(new Dec(-1).isInteger()).toBe(true);

    expect(new Dec(1.1).isInteger()).toBe(false);
    expect(new Dec(-1.1).isInteger()).toBe(false);

    expect(new Dec(0).isZero()).toBe(true);
    expect(new Dec(-0).isZero()).toBe(true);
    expect(new Dec(-1.1).isZero()).toBe(false);
    expect(new Dec(1.1).isZero()).toBe(false);
  });

  it("Test Dec comparison", () => {
    const dec1 = new Dec(1);
    const dec2 = new Dec(2);

    expect(dec1.gt(dec2)).toBe(false);
    expect(dec1.gte(dec1)).toBe(true);

    expect(dec1.lt(dec2)).toBe(true);
    expect(dec1.lte(dec1)).toBe(true);

    expect(dec1.equals(dec2)).toBe(false);
    expect(dec1.equals(dec1)).toBe(true);
  });

  it("Test Dec power", () => {
    const tests: {
      d1: Dec;
      i1: Int;
      exp: Dec;
    }[] = [
      {
        d1: new Dec(0),
        i1: new Int(12),
        exp: new Dec(0),
      },
      {
        d1: new Dec(0),
        i1: new Int(0),
        exp: new Dec(1),
      },
      {
        d1: new Dec(12),
        i1: new Int(0),
        exp: new Dec(1),
      },
      {
        d1: new Dec(-12),
        i1: new Int(0),
        exp: new Dec(1),
      },
      {
        d1: new Dec(-12),
        i1: new Int(1),
        exp: new Dec(-12),
      },
      {
        d1: new Dec(-12),
        i1: new Int(2),
        exp: new Dec(144),
      },
      {
        d1: new Dec(12),
        i1: new Int(3),
        exp: new Dec(1728),
      },
      {
        d1: new Dec(12),
        i1: new Int(-1),
        exp: new Dec("0.083333333333333333"),
      },
      {
        d1: new Dec(12),
        i1: new Int(-2),
        exp: new Dec("0.006944444444444444"),
      },
      {
        d1: new Dec(12),
        i1: new Int(-3),
        exp: new Dec("0.000578703703703704"),
      },
      {
        d1: new Dec(10),
        i1: new Int(4),
        exp: new Dec("10000"),
      },
      {
        d1: new Dec(10),
        i1: new Int(5),
        exp: new Dec("100000"),
      },
      {
        d1: new Dec(10),
        i1: new Int(-5),
        exp: new Dec("0.00001"),
      },
    ];

    for (const test of tests) {
      const res = test.d1.pow(test.i1);

      expect(res.toString()).toBe(test.exp.toString());
    }
  });

  it("dec should be caculated properly", () => {
    const tests: {
      d1: Dec;
      d2: Dec;
      expMul: Dec;
      expMulTruncate: Dec;
      expQuo: Dec;
      expQuoRoundUp: Dec;
      expQuoTruncate: Dec;
      expAdd: Dec;
      expSub: Dec;
    }[] = [
      {
        d1: new Dec(0),
        d2: new Dec(0),
        expMul: new Dec(0),
        expMulTruncate: new Dec(0),
        expQuo: new Dec(0),
        expQuoRoundUp: new Dec(0),
        expQuoTruncate: new Dec(0),
        expAdd: new Dec(0),
        expSub: new Dec(0),
      },
      {
        d1: new Dec(0),
        d2: new Dec(1),
        expMul: new Dec(0),
        expMulTruncate: new Dec(0),
        expQuo: new Dec(0),
        expQuoRoundUp: new Dec(0),
        expQuoTruncate: new Dec(0),
        expAdd: new Dec(1),
        expSub: new Dec(-1),
      },
      {
        d1: new Dec(-1),
        d2: new Dec(0),
        expMul: new Dec(0),
        expMulTruncate: new Dec(0),
        expQuo: new Dec(0),
        expQuoRoundUp: new Dec(0),
        expQuoTruncate: new Dec(0),
        expAdd: new Dec(-1),
        expSub: new Dec(-1),
      },
      {
        d1: new Dec(-1),
        d2: new Dec(1),
        expMul: new Dec(-1),
        expMulTruncate: new Dec(-1),
        expQuo: new Dec(-1),
        expQuoRoundUp: new Dec(-1),
        expQuoTruncate: new Dec(-1),
        expAdd: new Dec(0),
        expSub: new Dec(-2),
      },
      {
        d1: new Dec(3),
        d2: new Dec(7),
        expMul: new Dec(21),
        expMulTruncate: new Dec(21),
        expQuo: new Dec("428571428571428571", 18),
        expQuoRoundUp: new Dec("428571428571428572", 18),
        expQuoTruncate: new Dec("428571428571428571", 18),
        expAdd: new Dec(10),
        expSub: new Dec(-4),
      },
      {
        d1: new Dec(100),
        d2: new Dec(100),
        expMul: new Dec(10000),
        expMulTruncate: new Dec(10000),
        expQuo: new Dec(1),
        expQuoRoundUp: new Dec(1),
        expQuoTruncate: new Dec(1),
        expAdd: new Dec(200),
        expSub: new Dec(0),
      },
      {
        d1: new Dec(3333, 4),
        d2: new Dec(333, 4),
        expMul: new Dec(1109889, 8),
        expMulTruncate: new Dec(1109889, 8),
        expQuo: new Dec("10.009009009009009009"),
        expQuoRoundUp: new Dec("10.009009009009009010"),
        expQuoTruncate: new Dec("10.009009009009009009"),
        expAdd: new Dec(3666, 4),
        expSub: new Dec(3, 1),
      },
    ];

    for (const test of tests) {
      const resAdd = test.d1.add(test.d2);
      const resSub = test.d1.sub(test.d2);
      const resMul = test.d1.mul(test.d2);
      const resMulTruncate = test.d1.mulTruncate(test.d2);

      // invalid result of add
      expect(resAdd.toString()).toBe(test.expAdd.toString());
      // invalid result of sub
      expect(resSub.toString()).toBe(test.expSub.toString());
      // invalid result of mul
      expect(resMul.toString()).toBe(test.expMul.toString());
      // invalid result of mul
      expect(resMulTruncate.toString()).toBe(test.expMulTruncate.toString());

      if (test.d2.isZero()) {
        expect(() => {
          test.d1.quo(test.d2);
        }).toThrow();
      } else {
        const resQuo = test.d1.quo(test.d2);
        const resQuoRoundUp = test.d1.quoRoundUp(test.d2);
        const resQuoTruncate = test.d1.quoTruncate(test.d2);

        // invalid result of quo
        expect(resQuo.toString()).toBe(test.expQuo.toString());
        // invalid result of quo round up
        expect(resQuoRoundUp.toString()).toBe(test.expQuoRoundUp.toString());
        // invalid result of quo truncate
        expect(resQuoTruncate.toString()).toBe(test.expQuoTruncate.toString());
      }
    }
  });

  it("dec should be round up properly", () => {
    const tests: {
      d1: Dec;
      exp: Int;
    }[] = [
      {
        d1: new Dec("0.25"),
        exp: new Int("1"),
      },
      {
        d1: new Dec("0"),
        exp: new Int("0"),
      },
      {
        d1: new Dec("1"),
        exp: new Int("1"),
      },
      {
        d1: new Dec("0.75"),
        exp: new Int("1"),
      },
      {
        d1: new Dec("0.5"),
        exp: new Int("1"),
      },
      {
        d1: new Dec("7.5"),
        exp: new Int("8"),
      },
      {
        d1: new Dec("0.545"),
        exp: new Int("1"),
      },
      {
        d1: new Dec("1.545"),
        exp: new Int("2"),
      },
      {
        d1: new Dec("-1.545"),
        exp: new Int("-1"),
      },
      {
        d1: new Dec("-0.545"),
        exp: new Int("0"),
      },
    ];

    for (const test of tests) {
      const resPos = test.d1.roundUp();
      expect(resPos.toString()).toBe(test.exp.toString());

      const resPosDec = test.d1.roundUpDec();
      expect(resPosDec.toString()).toBe(
        test.exp.toString() + ".000000000000000000"
      );
    }
  });

  it("dec should be round properly", () => {
    const tests: {
      d1: Dec;
      exp: Int;
    }[] = [
      {
        d1: new Dec("0.25"),
        exp: new Int("0"),
      },
      {
        d1: new Dec("0"),
        exp: new Int("0"),
      },
      {
        d1: new Dec("1"),
        exp: new Int("1"),
      },
      {
        d1: new Dec("0.75"),
        exp: new Int("1"),
      },
      {
        d1: new Dec("0.5"),
        exp: new Int("0"),
      },
      {
        d1: new Dec("7.5"),
        exp: new Int("8"),
      },
      {
        d1: new Dec("0.545"),
        exp: new Int("1"),
      },
      {
        d1: new Dec("1.545"),
        exp: new Int("2"),
      },
    ];

    for (const test of tests) {
      const resNeg = test.d1.neg().round();
      expect(resNeg.toString()).toBe(test.exp.neg().toString());

      const resNegDec = test.d1.neg().roundDec();
      expect(resNegDec.toString()).toBe(
        test.exp.neg().toString() + ".000000000000000000"
      );

      const resPos = test.d1.round();
      expect(resPos.toString()).toBe(test.exp.toString());

      const resPosDec = test.d1.roundDec();
      expect(resPosDec.toString()).toBe(
        test.exp.toString() + ".000000000000000000"
      );
    }
  });

  it("dec should be truncated properly", () => {
    const tests: {
      d1: Dec;
      exp: Int;
    }[] = [
      {
        d1: new Dec("0"),
        exp: new Int("0"),
      },
      {
        d1: new Dec("0.25"),
        exp: new Int("0"),
      },
      {
        d1: new Dec("0.75"),
        exp: new Int("0"),
      },
      {
        d1: new Dec("1"),
        exp: new Int("1"),
      },
      {
        d1: new Dec("7.5"),
        exp: new Int("7"),
      },
      {
        d1: new Dec("7.6"),
        exp: new Int("7"),
      },
      {
        d1: new Dec("8.5"),
        exp: new Int("8"),
      },
      {
        d1: new Dec("100.000000001"),
        exp: new Int("100"),
      },
    ];

    for (const test of tests) {
      const resNeg = test.d1.neg().truncate();
      expect(resNeg.toString()).toBe(test.exp.neg().toString());

      const resNegDec = test.d1.neg().truncateDec();
      expect(resNegDec.toString()).toBe(
        test.exp.neg().toString() + ".000000000000000000"
      );

      const resPos = test.d1.truncate();
      expect(resPos.toString()).toBe(test.exp.toString());

      const resPosDec = test.d1.truncateDec();
      expect(resPosDec.toString()).toBe(
        test.exp.toString() + ".000000000000000000"
      );
    }
  });

  it("dec should be parsed to string properly", () => {
    const tests: {
      d1: Dec;
      precision: number;
      exp: string;
    }[] = [
      {
        d1: new Dec("0"),
        precision: 0,
        exp: "0",
      },
      {
        d1: new Dec("1.25"),
        precision: 0,
        exp: "1",
      },
      {
        d1: new Dec("0.75"),
        precision: 1,
        exp: "0.7",
      },
      {
        d1: new Dec("1"),
        precision: 5,
        exp: "1.00000",
      },
      {
        d1: new Dec(new Int("1")),
        precision: 5,
        exp: "1.00000",
      },
      {
        d1: new Dec("7.5"),
        precision: 3,
        exp: "7.500",
      },
      {
        d1: new Dec("100.000000001"),
        precision: 0,
        exp: "100",
      },
      {
        d1: new Dec(100.000000001),
        precision: 0,
        exp: "100",
      },
      {
        d1: new Dec("-0.25"),
        precision: 0,
        exp: "0",
      },
      {
        d1: new Dec("-1.25"),
        precision: 0,
        exp: "-1",
      },
      {
        d1: new Dec("-0.75"),
        precision: 1,
        exp: "-0.7",
      },
      {
        d1: new Dec("-1"),
        precision: 5,
        exp: "-1.00000",
      },
      {
        d1: new Dec(-1),
        precision: 5,
        exp: "-1.00000",
      },
      {
        d1: new Dec("-7.5"),
        precision: 3,
        exp: "-7.500",
      },
      {
        d1: new Dec(-7.5),
        precision: 3,
        exp: "-7.500",
      },
      {
        d1: new Dec("-100.000000001"),
        precision: 0,
        exp: "-100",
      },
      {
        d1: new Dec(-100.000000001),
        precision: 0,
        exp: "-100",
      },
    ];

    for (const test of tests) {
      const res = test.d1.toString(test.precision);
      expect(res).toBe(test.exp);
    }
  });

  it("Test case that input decimals exceeds 18", () => {
    const tests: {
      input: number | string;
      res: Dec;
      resStr: string;
    }[] = [
      {
        input: "0.489234893284938249348923849283408",
        res: new Dec("0.489234893284938249"),
        resStr: "0.489234893284938249",
      },
      {
        input: 0.0000010000000249348,
        res: new Dec("0.000001000000024934"),
        resStr: "0.000001000000024934",
      },
      {
        input: "0.0000000000000000001",
        res: new Dec("0"),
        resStr: "0.000000000000000000",
      },
      {
        input: 0.0000000000000000001,
        res: new Dec("0"),
        resStr: "0.000000000000000000",
      },
    ];

    for (const test of tests) {
      const dec = new Dec(test.input);

      expect(dec.equals(test.res)).toBe(true);
      expect(dec.toString()).toBe(test.resStr);
    }
  });

  it("Test Int/Uint from exponent number", () => {
    const tests: {
      num: number;
      str: string;
      expect: Dec;
    }[] = [
      {
        num: 12345678901234567890123,
        str: "1.2345678901234568e+22",
        expect: new Dec("12345678901234568000000"),
      },
      {
        num: -12345678901234567890123,
        str: "-1.2345678901234568e+22",
        expect: new Dec("-12345678901234568000000"),
      },
      {
        num: 0.0000000000001,
        str: "1e-13",
        expect: new Dec("0.0000000000001"),
      },
      {
        num: 0.000000000000123,
        str: "1.23e-13",
        expect: new Dec("0.000000000000123"),
      },
      {
        num: 0.000000000000000001,
        str: "1e-18",
        expect: new Dec("0.000000000000000001"),
      },
      {
        num: 0.0000000000000000001,
        str: "1e-19",
        expect: new Dec("0"),
      },
      {
        num: 0.00000000000000000123,
        str: "1.23e-18",
        expect: new Dec("0.000000000000000001"),
      },
      {
        num: 0.000000000000000000123,
        str: "1.23e-19",
        expect: new Dec("0"),
      },
    ];

    for (const test of tests) {
      expect(test.num.toString()).toBe(test.str);

      expect(new Dec(test.num).equals(test.expect)).toBe(true);
    }
  });
});
