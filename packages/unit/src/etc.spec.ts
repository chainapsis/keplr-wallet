import { exponentDecStringToDecString } from "./etc";

describe("Test etc utils", () => {
  it("Test exponentDecStringToDecString", () => {
    expect(exponentDecStringToDecString("1e+0")).toBe("1");
    expect(exponentDecStringToDecString("1e+1")).toBe("10");
    expect(exponentDecStringToDecString("123e+1")).toBe("1230");
    expect(exponentDecStringToDecString("123e+2")).toBe("12300");
    expect(exponentDecStringToDecString("123e+3")).toBe("123000");
    expect(exponentDecStringToDecString("123e+4")).toBe("1230000");

    expect(exponentDecStringToDecString("-1e+0")).toBe("-1");
    expect(exponentDecStringToDecString("-1e+1")).toBe("-10");
    expect(exponentDecStringToDecString("-123e+1")).toBe("-1230");
    expect(exponentDecStringToDecString("-123e+2")).toBe("-12300");
    expect(exponentDecStringToDecString("-123e+3")).toBe("-123000");
    expect(exponentDecStringToDecString("-123e+4")).toBe("-1230000");

    expect(exponentDecStringToDecString("1.2e+0")).toBe("1.2");
    expect(exponentDecStringToDecString("1.2e+1")).toBe("12");
    expect(exponentDecStringToDecString("1.23e+1")).toBe("12.3");
    expect(exponentDecStringToDecString("1.23e+2")).toBe("123");
    expect(exponentDecStringToDecString("1.23e+3")).toBe("1230");
    expect(exponentDecStringToDecString("1.23e+4")).toBe("12300");

    expect(exponentDecStringToDecString("-1.2e+0")).toBe("-1.2");
    expect(exponentDecStringToDecString("-1.2e+1")).toBe("-12");
    expect(exponentDecStringToDecString("-1.23e+1")).toBe("-12.3");
    expect(exponentDecStringToDecString("-1.23e+2")).toBe("-123");
    expect(exponentDecStringToDecString("-1.23e+3")).toBe("-1230");
    expect(exponentDecStringToDecString("-1.23e+4")).toBe("-12300");

    expect(exponentDecStringToDecString("1e-0")).toBe("1");
    expect(exponentDecStringToDecString("1e-1")).toBe("0.1");
    expect(exponentDecStringToDecString("123e-1")).toBe("12.3");
    expect(exponentDecStringToDecString("123e-2")).toBe("1.23");
    expect(exponentDecStringToDecString("123e-3")).toBe("0.123");
    expect(exponentDecStringToDecString("123e-4")).toBe("0.0123");

    expect(exponentDecStringToDecString("-1e-0")).toBe("-1");
    expect(exponentDecStringToDecString("-1e-1")).toBe("-0.1");
    expect(exponentDecStringToDecString("-123e-1")).toBe("-12.3");
    expect(exponentDecStringToDecString("-123e-2")).toBe("-1.23");
    expect(exponentDecStringToDecString("-123e-3")).toBe("-0.123");
    expect(exponentDecStringToDecString("-123e-4")).toBe("-0.0123");

    expect(exponentDecStringToDecString("1.2e-0")).toBe("1.2");
    expect(exponentDecStringToDecString("1.2e-1")).toBe("0.12");
    expect(exponentDecStringToDecString("1.23e-1")).toBe("0.123");
    expect(exponentDecStringToDecString("1.23e-2")).toBe("0.0123");
    expect(exponentDecStringToDecString("1.23e-3")).toBe("0.00123");
    expect(exponentDecStringToDecString("1.23e-4")).toBe("0.000123");

    expect(exponentDecStringToDecString("-1.2e-0")).toBe("-1.2");
    expect(exponentDecStringToDecString("-1.2e-1")).toBe("-0.12");
    expect(exponentDecStringToDecString("-1.23e-1")).toBe("-0.123");
    expect(exponentDecStringToDecString("-1.23e-2")).toBe("-0.0123");
    expect(exponentDecStringToDecString("-1.23e-3")).toBe("-0.00123");
    expect(exponentDecStringToDecString("-1.23e-4")).toBe("-0.000123");

    expect(exponentDecStringToDecString("0.00123e+1")).toBe("0.0123");
    expect(exponentDecStringToDecString("0.00123e-1")).toBe("0.000123");
    expect(exponentDecStringToDecString("0.00123e+4")).toBe("12.3");
    expect(exponentDecStringToDecString("0.00123e-4")).toBe("0.000000123");
    expect(exponentDecStringToDecString("1234.567e+2")).toBe("123456.7");
    expect(exponentDecStringToDecString("1234.567e+3")).toBe("1234567");
    expect(exponentDecStringToDecString("1234.567e+4")).toBe("12345670");
    expect(exponentDecStringToDecString("1234.567e+10")).toBe("12345670000000");

    expect(exponentDecStringToDecString("-0.00123e+1")).toBe("-0.0123");
    expect(exponentDecStringToDecString("-0.00123e-1")).toBe("-0.000123");
  });
});
