import { DecUtils } from "./dec-utils";
import { Dec } from "./decimal";

describe("Test DecUtils", () => {
  it("Test trim in DecUtils", () => {
    expect(DecUtils.trim("0.00100")).toBe("0.001");
    expect(DecUtils.trim("0.00")).toBe("0");
    expect(DecUtils.trim("-0.00100")).toBe("-0.001");
    expect(DecUtils.trim("-0.00")).toBe("-0");
  });

  it("getPrecisionDec should return the (10^precision)", () => {
    expect(DecUtils.getPrecisionDec(-1).toString()).toBe(
      new Dec("0.1").toString()
    );
    expect(DecUtils.getPrecisionDec(-5).toString()).toBe(
      new Dec("0.00001").toString()
    );

    expect(DecUtils.getPrecisionDec(0).toString()).toBe(new Dec(1).toString());
    expect(DecUtils.getPrecisionDec(1).toString()).toBe(new Dec(10).toString());
    expect(DecUtils.getPrecisionDec(5).toString()).toBe(
      new Dec(100000).toString()
    );
  });

  it("getPrecisionDec can have maximum 18 precision", () => {
    expect(() => {
      DecUtils.getPrecisionDec(18);
    }).not.toThrow();

    expect(() => {
      DecUtils.getPrecisionDec(19);
    }).toThrow();

    expect(() => {
      DecUtils.getPrecisionDec(-18);
    }).not.toThrow();

    expect(() => {
      DecUtils.getPrecisionDec(-19);
    }).toThrow();
  });

  it("getTenExponentN should return same cached result", () => {
    for (let i = 0; i < 3; i++) {
      expect(DecUtils.getTenExponentN(5).toString()).toBe(
        new Dec(100000).toString()
      );
    }
  });

  it("Test getTenExponentN", () => {
    expect(DecUtils.getTenExponentN(0).toString()).toBe(
      new Dec("1").toString()
    );

    expect(DecUtils.getTenExponentN(1).toString()).toBe(
      new Dec("10").toString()
    );

    expect(DecUtils.getTenExponentN(10).toString()).toBe(
      new Dec("10000000000").toString()
    );

    expect(DecUtils.getTenExponentN(20).toString()).toBe(
      new Dec("100000000000000000000").toString()
    );

    expect(DecUtils.getTenExponentN(-18).toString()).toBe(
      new Dec("0.000000000000000001").toString()
    );

    expect(() => DecUtils.getTenExponentN(-19)).toThrow();
  });
});
