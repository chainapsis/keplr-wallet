import { RatePretty } from "./rate-pretty";
import { Dec } from "./decimal";

describe("Test RatePretty", () => {
  it("Basic test for RatePretty", () => {
    const pretty = new RatePretty(new Dec("0.3"));

    expect(pretty.toDec().equals(new Dec("0.3"))).toBe(true);
    expect(pretty.toDec().toString(1)).toBe("0.3");

    expect(pretty.toString()).toBe("30%");
    expect(pretty.moveDecimalPointLeft(1).toString()).toBe("3%");
    expect(pretty.moveDecimalPointRight(1).toString()).toBe("300%");

    expect(pretty.add(new Dec("0.1")).toString()).toBe("40%");
    expect(pretty.add(new Dec("0.1")).toDec().toString(1)).toBe("0.4");
    expect(pretty.sub(new Dec("0.1")).toString()).toBe("20%");
    expect(pretty.sub(new Dec("0.1")).toDec().toString(1)).toBe("0.2");
    expect(pretty.mul(new Dec("0.1")).toString()).toBe("3%");
    expect(pretty.mul(new Dec("0.1")).toDec().toString(2)).toBe("0.03");
    expect(pretty.quo(new Dec("0.1")).toString()).toBe("300%");
    expect(pretty.quo(new Dec("0.1")).toDec().toString(1)).toBe("3.0");

    expect(new RatePretty(new Dec("0.001")).toString()).toBe("0.1%");
    expect(new RatePretty(new Dec("0.00001")).toString()).toBe("0.001%");
    expect(new RatePretty(new Dec("0.000001")).toString()).toBe("< 0.001%");

    expect(new RatePretty(new Dec("0")).toString()).toBe("0%");
    expect(new RatePretty(new Dec("-0")).toString()).toBe("0%");

    expect(
      new RatePretty(new Dec("0.000001")).separator(" ").symbol("?").toString()
    ).toBe("< 0.001 ?");

    expect(
      new RatePretty(new Dec("0.000001")).inequalitySymbol(false).toString()
    ).toBe("0%");
    expect(
      new RatePretty(new Dec("0.000001"))
        .inequalitySymbol(false)
        .maxDecimals(4)
        .toString()
    ).toBe("0.0001%");

    expect(new RatePretty(new Dec("-0.000001")).toString()).toBe("> -0.001%");

    expect(
      new RatePretty(new Dec("-0.000001")).inequalitySymbol(false).toString()
      // TODO: Delete the case of "-0". Return "0"
    ).toBe("-0%");
  });
});
