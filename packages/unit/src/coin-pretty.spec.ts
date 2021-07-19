import { CoinPretty } from "./coin-pretty";
import { Dec } from "./decimal";
import { Int } from "./int";

describe("Test CoinPretty", () => {
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
    expect(pretty.precision(0).toString()).toBe("1,234.000000 ATOM");
    expect(pretty.precision(0).trim(true).toString()).toBe("1,234 ATOM");
    expect(pretty.precision(-2).toString()).toBe("123,400.000000 ATOM");
    expect(pretty.precision(-2).shrink(true).toString()).toBe("123,400.0 ATOM");

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

    expect(pretty.options.precision).toBe(10);
    expect(pretty.toString()).toBe("0.000012 ATOM");
    expect(pretty.maxDecimals(10).toString()).toBe("0.0000121234 ATOM");
    expect(pretty.increasePrecision(1).toString()).toBe("0.000001 ATOM");
    expect(pretty.decreasePrecision(1).toString()).toBe("0.000121 ATOM");
    expect(pretty.precision(0).toString()).toBe("121,234.000000 ATOM");
    expect(pretty.precision(0).trim(true).toString()).toBe("121,234 ATOM");
    expect(pretty.precision(-2).toString()).toBe("12,123,400.000000 ATOM");
    expect(pretty.precision(-2).shrink(true).toString()).toBe(
      "12,123,400.0 ATOM"
    );

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
});
