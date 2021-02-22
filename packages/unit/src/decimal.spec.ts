import assert from "assert";
import "mocha";
import { Dec } from "./decimal";
import { Int } from "./int";

describe("Test decimals", () => {
  it("dec should be parsed from str properly", () => {
    let dec = new Dec("10.009");
    assert.strictEqual(dec.toString(), "10.009000000000000000");
    assert.strictEqual(dec.toString(2), "10.00");

    dec = new Dec("-123.45678900");
    assert.strictEqual(dec.toString(), "-123.456789000000000000");
    assert.strictEqual(dec.toString(3), "-123.456");

    dec = new Dec("10");
    assert.strictEqual(dec.toString(), "10.000000000000000000");

    assert.throws(() => {
      new Dec("");
    });
    assert.throws(() => {
      new Dec("0.-75");
    });
    assert.throws(() => {
      new Dec("0.489234893284938249348923849283408");
    });
    assert.throws(() => {
      new Dec("foobar");
    });
    assert.throws(() => {
      new Dec("0.foobar");
    });
    assert.throws(() => {
      new Dec("foobar.0");
    });
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

      assert.strictEqual(
        resAdd.toString(),
        test.expAdd.toString(),
        "invalid result of add"
      );
      assert.strictEqual(
        resSub.toString(),
        test.expSub.toString(),
        "invalid result of sub"
      );
      assert.strictEqual(
        resMul.toString(),
        test.expMul.toString(),
        "invalid result of mul"
      );
      assert.strictEqual(
        resMulTruncate.toString(),
        test.expMulTruncate.toString(),
        "invalid result of mul"
      );

      if (test.d2.isZero()) {
        assert.throws(() => {
          test.d1.quo(test.d2);
        });
      } else {
        const resQuo = test.d1.quo(test.d2);
        const resQuoRoundUp = test.d1.quoRoundUp(test.d2);
        const resQuoTruncate = test.d1.quoTruncate(test.d2);

        assert.strictEqual(
          resQuo.toString(),
          test.expQuo.toString(),
          "invalid result of quo"
        );
        assert.strictEqual(
          resQuoRoundUp.toString(),
          test.expQuoRoundUp.toString(),
          "invalid result of quo round up"
        );
        assert.strictEqual(
          resQuoTruncate.toString(),
          test.expQuoTruncate.toString(),
          "invalid result of quo truncate"
        );
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
      assert.strictEqual(resNeg.toString(), test.exp.neg().toString());

      const resPos = test.d1.round();
      assert.strictEqual(resPos.toString(), test.exp.toString());
    }
  });

  it("dec should be round up truncated", () => {
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
      assert.strictEqual(resNeg.toString(), test.exp.neg().toString());

      const resPos = test.d1.truncate();
      assert.strictEqual(resPos.toString(), test.exp.toString());
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
        d1: new Dec("-7.5"),
        precision: 3,
        exp: "-7.500",
      },
      {
        d1: new Dec("-100.000000001"),
        precision: 0,
        exp: "-100",
      },
    ];

    for (const test of tests) {
      const res = test.d1.toString(test.precision);
      assert.strictEqual(res, test.exp);
    }
  });
});
