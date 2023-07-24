import { clearDecimals } from "./decimals";

describe("clearDecimals", () => {
  it("should return the input string if it does not contain a decimal point", () => {
    const input = "1234";
    expect(clearDecimals(input)).toBe(input);
  });

  it("should remove trailing zeros after the decimal point", () => {
    const input = "1234.0000";
    const expected = "1234";
    expect(clearDecimals(input)).toBe(expected);
  });

  it("should remove the decimal point if the last character is a dot", () => {
    const input = "1234.";
    const expected = "1234";
    expect(clearDecimals(input)).toBe(expected);
  });

  it("should remove trailing zeros and the decimal point if both are present", () => {
    const input = "12.340000";
    const expected = "12.34";
    expect(clearDecimals(input)).toBe(expected);
  });

  it("should handle decimals with no trailing zeros", () => {
    const input = "12.34";
    expect(clearDecimals(input)).toBe(input);
  });

  it("should handle input with multiple decimal points", () => {
    const input = "12.34.56.000";
    const expected = "12.34.56";
    expect(clearDecimals(input)).toBe(expected);
  });

  it("should handle an empty string input", () => {
    const input = "";
    expect(clearDecimals(input)).toBe(input);
  });
});
