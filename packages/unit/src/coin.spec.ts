import { Coin } from "./coin";

describe("Test coin", () => {
  it("coin parsed from str properly", () => {
    let coin = Coin.parse("1000test");

    expect(coin.denom).toBe("test");
    expect(coin.amount.toString()).toBe("1000");

    coin = Coin.parse("1000tesT");

    expect(coin.denom).toBe("tesT");
    expect(coin.amount.toString()).toBe("1000");

    coin = Coin.parse("1000TEST");

    expect(coin.denom).toBe("TEST");
    expect(coin.amount.toString()).toBe("1000");
  });
});
