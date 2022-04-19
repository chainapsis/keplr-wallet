import { CoinPretty } from "./coin-pretty";
import { Dec } from "./decimal";
import { Int } from "./int";
import { CoinUtils } from "./coin-utils";
import { DecUtils } from "./dec-utils";

describe("Test CoinPretty", () => {
  it("Test creation of CoinPretty", () => {
    expect(
      new CoinPretty(
        {
          coinDenom: "ATOM",
          coinMinimalDenom: "uatom",
          coinDecimals: 6,
        },
        new Int(1234)
      )
        .toDec()
        .equals(new Dec("0.001234"))
    ).toBe(true);
    expect(
      new CoinPretty(
        {
          coinDenom: "ATOM",
          coinMinimalDenom: "uatom",
          coinDecimals: 6,
        },
        new Int(1234)
      ).toString()
    ).toBe("0.001234 ATOM");

    expect(
      new CoinPretty(
        {
          coinDenom: "ATOM",
          coinMinimalDenom: "uatom",
          coinDecimals: 6,
        },
        1234
      )
        .toDec()
        .equals(new Dec("0.001234"))
    ).toBe(true);
    expect(
      new CoinPretty(
        {
          coinDenom: "ATOM",
          coinMinimalDenom: "uatom",
          coinDecimals: 6,
        },
        1234
      ).toString()
    ).toBe("0.001234 ATOM");

    expect(
      new CoinPretty(
        {
          coinDenom: "ATOM",
          coinMinimalDenom: "uatom",
          coinDecimals: 6,
        },
        "1234.5"
      )
        .toDec()
        .equals(new Dec("0.0012345"))
    ).toBe(true);
    expect(
      new CoinPretty(
        {
          coinDenom: "ATOM",
          coinMinimalDenom: "uatom",
          coinDecimals: 6,
        },
        "1234.5"
      ).toString()
    ).toBe("0.001234 ATOM");

    expect(
      new CoinPretty(
        {
          coinDenom: "ATOM",
          coinMinimalDenom: "uatom",
          coinDecimals: 6,
        },
        new Dec("1234.5")
      )
        .toDec()
        .equals(new Dec("0.0012345"))
    ).toBe(true);
    expect(
      new CoinPretty(
        {
          coinDenom: "ATOM",
          coinMinimalDenom: "uatom",
          coinDecimals: 6,
        },
        new Dec("1234.5")
      ).toString()
    ).toBe("0.001234 ATOM");
  });

  it("Basic test for CoinPretty", () => {
    const pretty = new CoinPretty(
      {
        coinDenom: "ATOM",
        coinMinimalDenom: "uatom",
        coinDecimals: 6,
      },
      new Int(1234)
    );
    expect(pretty.toDec().equals(new Dec("0.001234"))).toBeTruthy();

    expect(pretty.toString()).toBe("0.001234 ATOM");
    expect(pretty.separator("").toString()).toBe("0.001234ATOM");
    expect(pretty.increasePrecision(1).toString()).toBe("0.000123 ATOM");
    expect(pretty.decreasePrecision(1).toString()).toBe("0.012340 ATOM");
    expect(pretty.decreasePrecision(1).trim(true).toString()).toBe(
      "0.01234 ATOM"
    );
    expect(pretty.moveDecimalPointLeft(1).toString()).toBe("0.000123 ATOM");
    expect(pretty.moveDecimalPointRight(1).toString()).toBe("0.012340 ATOM");
    expect(pretty.moveDecimalPointRight(1).trim(true).toString()).toBe(
      "0.01234 ATOM"
    );

    expect(pretty.maxDecimals(7).add(new Dec("0.1")).toString()).toBe(
      "0.0012341 ATOM"
    );
    expect(pretty.maxDecimals(7).sub(new Dec("0.1")).toString()).toBe(
      "0.0012339 ATOM"
    );
    expect(pretty.maxDecimals(7).mul(new Dec("0.1")).toString()).toBe(
      "0.0001234 ATOM"
    );
    expect(pretty.maxDecimals(7).quo(new Dec("0.1")).toString()).toBe(
      "0.0123400 ATOM"
    );

    expect(
      pretty
        .add(
          new CoinPretty(
            {
              coinDenom: "ATOM",
              coinMinimalDenom: "uatom",
              coinDecimals: 6,
            },
            new Int(1200000)
          )
        )
        .toString()
    ).toBe("1.201234 ATOM");
    expect(
      pretty
        .sub(
          new CoinPretty(
            {
              coinDenom: "ATOM",
              coinMinimalDenom: "uatom",
              coinDecimals: 6,
            },
            new Int(1200000)
          )
        )
        .toString()
    ).toBe("-1.198766 ATOM");

    // If target is `CoinPretty` and it has different denom, do nothing.
    expect(
      pretty
        .add(
          new CoinPretty(
            {
              coinDenom: "SCRT",
              coinMinimalDenom: "uscrt",
              coinDecimals: 6,
            },
            new Int(1200000)
          )
        )
        .toString()
    ).toBe("0.001234 ATOM");
    // If target is `CoinPretty` and it has different denom, do nothing.
    expect(
      pretty
        .sub(
          new CoinPretty(
            {
              coinDenom: "SCRT",
              coinMinimalDenom: "uscrt",
              coinDecimals: 6,
            },
            new Int(1200000)
          )
        )
        .toString()
    ).toBe("0.001234 ATOM");
  });

  it("Basic test for CoinPretty 2", () => {
    const pretty = new CoinPretty(
      {
        coinDenom: "ATOM",
        coinMinimalDenom: "uatom",
        coinDecimals: 6,
      },
      new Dec("12.1234")
    );

    expect(pretty.toString()).toBe("0.000012 ATOM");
    expect(pretty.maxDecimals(10).toString()).toBe("0.0000121234 ATOM");
    expect(pretty.increasePrecision(1).toString()).toBe("0.000001 ATOM");
    expect(pretty.decreasePrecision(1).toString()).toBe("0.000121 ATOM");
    expect(pretty.moveDecimalPointLeft(1).toString()).toBe("0.000001 ATOM");
    expect(pretty.moveDecimalPointRight(1).toString()).toBe("0.000121 ATOM");

    expect(pretty.maxDecimals(7).add(new Dec("0.1")).toString()).toBe(
      "0.0000122 ATOM"
    );
    expect(pretty.maxDecimals(7).sub(new Dec("0.1")).toString()).toBe(
      "0.0000120 ATOM"
    );
    expect(pretty.maxDecimals(7).mul(new Dec("0.1")).toString()).toBe(
      "0.0000012 ATOM"
    );
    expect(pretty.maxDecimals(7).quo(new Dec("0.1")).toString()).toBe(
      "0.0001212 ATOM"
    );

    expect(
      pretty
        .add(
          new CoinPretty(
            {
              coinDenom: "ATOM",
              coinMinimalDenom: "uatom",
              coinDecimals: 6,
            },
            new Int(1200000)
          )
        )
        .toString()
    ).toBe("1.200012 ATOM");
    expect(
      pretty
        .sub(
          new CoinPretty(
            {
              coinDenom: "ATOM",
              coinMinimalDenom: "uatom",
              coinDecimals: 6,
            },
            new Int(1200000)
          )
        )
        .toString()
    ).toBe("-1.199987 ATOM");
  });

  it("Test toCoin() for CoinPretty", () => {
    expect(
      new CoinPretty(
        {
          coinDenom: "ATOM",
          coinMinimalDenom: "uatom",
          coinDecimals: 6,
        },
        new Dec("0.1234")
      ).toCoin()
    ).toStrictEqual({
      denom: "uatom",
      amount: "0",
    });

    expect(
      new CoinPretty(
        {
          coinDenom: "ATOM",
          coinMinimalDenom: "uatom",
          coinDecimals: 6,
        },
        new Dec("12.1234")
      ).toCoin()
    ).toStrictEqual({
      denom: "uatom",
      amount: "12",
    });

    expect(
      new CoinPretty(
        {
          coinDenom: "ATOM",
          coinMinimalDenom: "uatom",
          coinDecimals: 6,
        },
        new Dec("123456.1234")
      ).toCoin()
    ).toStrictEqual({
      denom: "uatom",
      amount: "123456",
    });

    expect(
      new CoinPretty(
        {
          coinDenom: "ATOM",
          coinMinimalDenom: "uatom",
          coinDecimals: 6,
        },
        new Int("12345600")
      ).toCoin()
    ).toStrictEqual({
      denom: "uatom",
      amount: "12345600",
    });
  });

  it("Test CoinPretty's setCurrency", () => {
    const pretty = new CoinPretty(
      {
        coinDenom: "ATOM",
        coinMinimalDenom: "uatom",
        coinDecimals: 6,
      },
      new Int("123456")
    );

    expect(
      pretty
        .setCurrency({
          coinDenom: "TEST",
          coinMinimalDenom: "utest",
          coinDecimals: 6,
        })
        .toString()
    ).toBe("0.123456 TEST");

    expect(
      pretty
        .setCurrency({
          coinDenom: "TEST",
          coinMinimalDenom: "utest",
          coinDecimals: 3,
        })
        .toString()
    ).toBe("123.456000 TEST");

    expect(
      pretty
        .setCurrency({
          coinDenom: "TEST",
          coinMinimalDenom: "utest",
          coinDecimals: 3,
        })
        .moveDecimalPointLeft(2)
        .moveDecimalPointRight(1)
        .trim(true)
        .toString()
    ).toBe("12.3456 TEST");
  });

  it("Test CoinPretty's toString()", () => {
    const tests: {
      base: CoinPretty;
      pre: (pretty: CoinPretty) => CoinPretty;
      res: string;
    }[] = [
      {
        base: new CoinPretty(
          {
            coinDenom: "ATOM",
            coinMinimalDenom: "uatom",
            coinDecimals: 6,
          },
          new Int("12345600")
        ),
        pre: (pretty) => pretty,
        res: "12.345600 ATOM",
      },
      {
        base: new CoinPretty(
          {
            coinDenom: "ATOM",
            coinMinimalDenom: "uatom",
            coinDecimals: 6,
          },
          new Int("12345600")
        ),
        pre: (pretty) => pretty.hideDenom(true),
        res: "12.345600",
      },
      {
        base: new CoinPretty(
          {
            coinDenom: "ATOM",
            coinMinimalDenom: "uatom",
            coinDecimals: 6,
          },
          new Int("12345600")
        ),
        pre: (pretty) => pretty.separator(""),
        res: "12.345600ATOM",
      },
      {
        base: new CoinPretty(
          {
            coinDenom: "ATOM",
            coinMinimalDenom: "uatom",
            coinDecimals: 6,
          },
          new Int("12345600")
        ),
        pre: (pretty) => pretty.maxDecimals(3),
        res: "12.345 ATOM",
      },
      {
        base: new CoinPretty(
          {
            coinDenom: "ATOM",
            coinMinimalDenom: "uatom",
            coinDecimals: 6,
          },
          new Int("12345600")
        ),
        pre: (pretty) => pretty.maxDecimals(3).separator(""),
        res: "12.345ATOM",
      },
      {
        base: new CoinPretty(
          {
            coinDenom: "ATOM",
            coinMinimalDenom: "uatom",
            coinDecimals: 6,
          },
          new Int("12345600")
        ),
        pre: (pretty) => pretty.lowerCase(true),
        res: "12.345600 atom",
      },
      {
        base: new CoinPretty(
          {
            coinDenom: "AtoM",
            coinMinimalDenom: "uatom",
            coinDecimals: 6,
          },
          new Int("12345600")
        ),
        pre: (pretty) => pretty.upperCase(true),
        res: "12.345600 ATOM",
      },
      {
        base: new CoinPretty(
          {
            coinDenom: "ATOM",
            coinMinimalDenom: "uatom",
            coinDecimals: 6,
          },
          new Int("1234560000")
        ),
        pre: (pretty) => pretty,
        res: "1,234.560000 ATOM",
      },
      {
        base: new CoinPretty(
          {
            coinDenom: "ATOM",
            coinMinimalDenom: "uatom",
            coinDecimals: 6,
          },
          new Int("1234560000")
        ),
        pre: (pretty) => pretty.locale(false),
        res: "1234.560000 ATOM",
      },
      {
        base: new CoinPretty(
          {
            coinDenom: "ATOM",
            coinMinimalDenom: "uatom",
            coinDecimals: 6,
          },
          new Int("1234560000")
        ),
        pre: (pretty) => pretty.shrink(true),
        res:
          CoinUtils.shrinkDecimals(
            new Dec("1234560000").mul(DecUtils.getTenExponentN(-6)),
            0,
            6,
            true
          ) + " ATOM",
      },
      {
        base: new CoinPretty(
          {
            coinDenom: "ATOM",
            coinMinimalDenom: "uatom",
            coinDecimals: 6,
          },
          new Int("1234560000")
        ),
        pre: (pretty) => pretty.locale(false).shrink(true),
        res:
          CoinUtils.shrinkDecimals(
            new Dec("1234560000").mul(DecUtils.getTenExponentN(-6)),
            0,
            6,
            false
          ) + " ATOM",
      },
    ];

    for (const test of tests) {
      expect(test.pre(test.base).toString()).toBe(test.res);
    }
  });
});
