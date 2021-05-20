import { DecUtils } from "./dec-utils";
import { Dec } from "./decimal";

describe("Test DecUtils", () => {
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
});
