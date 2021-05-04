import { PricePretty } from "./price-pretty";
import { Dec } from "./decimal";

describe("Test PricePretty", () => {
  it("Basic test for PricePretty", () => {
    const pretty = new PricePretty(
      {
        currency: "usd",
        symbol: "$",
        maxDecimals: 2,
        locale: "en-US",
      },
      new Dec("12.1234")
    );

    expect(pretty.toString()).toBe("$12.1");
    expect(pretty.increasePrecision(1).toString()).toBe("$1.21");
    expect(pretty.decreasePrecision(1).toString()).toBe("$121");
    expect(pretty.precision(0).toString()).toBe("$121,234");
    expect(pretty.precision(-2).toString()).toBe("$12,123,400");

    expect(pretty.add(new Dec("0.1")).toString()).toBe("$12.2");
    expect(pretty.sub(new Dec("0.1")).toString()).toBe("$12");
    expect(pretty.mul(new Dec("0.1")).toString()).toBe("$1.21");
    expect(pretty.quo(new Dec("0.1")).toString()).toBe("$121");

    expect(
      new PricePretty(
        {
          currency: "usd",
          symbol: "$",
          maxDecimals: 2,
          locale: "en-US",
        },
        new Dec("0.001")
      ).toString()
    ).toBe("< $0.01");
  });
});
