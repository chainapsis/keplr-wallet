import { CoinUtils } from "./coin-utils";

describe("Test CoinUtils", () => {
  it("Test integerStringToUSLocaleString", () => {
    expect(CoinUtils.integerStringToUSLocaleString("123456789")).toBe(
      "123,456,789"
    );

    expect(CoinUtils.integerStringToUSLocaleString("0")).toBe("0");

    expect(CoinUtils.integerStringToUSLocaleString("123")).toBe("123");
    expect(CoinUtils.integerStringToUSLocaleString("12")).toBe("12");
    expect(CoinUtils.integerStringToUSLocaleString("1234")).toBe("1,234");
  });
});
