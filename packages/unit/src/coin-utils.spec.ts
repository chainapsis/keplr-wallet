import { CoinUtils } from "./coin-utils";
import { Dec } from "./decimal";

describe("Test CoinUtils", () => {
  it("Test integerStringToUSLocaleString", () => {
    expect(CoinUtils.integerStringToUSLocaleString("123456789")).toBe(
      "123,456,789"
    );

    expect(CoinUtils.integerStringToUSLocaleString("0")).toBe("0");

    expect(CoinUtils.integerStringToUSLocaleString("123")).toBe("123");
    expect(CoinUtils.integerStringToUSLocaleString("12")).toBe("12");
    expect(CoinUtils.integerStringToUSLocaleString("1234")).toBe("1,234");

    expect(CoinUtils.integerStringToUSLocaleString("-1234")).toBe("-1,234");
    expect(CoinUtils.integerStringToUSLocaleString("-123456789")).toBe(
      "-123,456,789"
    );
  });

  it("Test shrink", () => {
    expect(CoinUtils.shrinkDecimals(new Dec(1234.56789), 3, 6)).toBe(
      "1234.567"
    );
    expect(CoinUtils.shrinkDecimals(new Dec(1234.56789), 3, 6, true)).toBe(
      "1,234.567"
    );
    expect(CoinUtils.shrinkDecimals(new Dec(1234), 3, 6)).toBe("1234.000");

    expect(CoinUtils.shrinkDecimals(new Dec(-1234.56789), 3, 6)).toBe(
      "-1234.567"
    );
    expect(CoinUtils.shrinkDecimals(new Dec(-1234.56789), 3, 6, true)).toBe(
      "-1,234.567"
    );

    expect(CoinUtils.shrinkDecimals(new Dec(1234.56789), 0, 0)).toBe("1234");
    expect(CoinUtils.shrinkDecimals(new Dec(-1234.56789), 0, 0)).toBe("-1234");
    expect(CoinUtils.shrinkDecimals(new Dec(1234.56789), 1, 1)).toBe("1234.5");
    expect(CoinUtils.shrinkDecimals(new Dec(-1234.56789), 1, 1)).toBe(
      "-1234.5"
    );
    expect(CoinUtils.shrinkDecimals(new Dec(1234), 1, 1)).toBe("1234.0");
    expect(CoinUtils.shrinkDecimals(new Dec(-1234), 1, 1)).toBe("-1234.0");
  });
});
