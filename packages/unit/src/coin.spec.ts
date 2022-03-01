import { Coin } from "./coin";

describe("Test coin", () => {
  it("coin parsed from str properly", () => {
    let coin = Coin.parse("1000test");

    expect(coin.denom).toBe("test");
    expect(coin.amount.toString()).toBe("1000");
    expect(coin.toString()).toBe("1000test");

    coin = Coin.parse("1000tesT");

    expect(coin.denom).toBe("tesT");
    expect(coin.amount.toString()).toBe("1000");
    expect(coin.toString()).toBe("1000tesT");

    coin = Coin.parse("1000TEST");

    expect(coin.denom).toBe("TEST");
    expect(coin.amount.toString()).toBe("1000");
    expect(coin.toString()).toBe("1000TEST");

    coin = Coin.parse("1000 TEST");

    expect(coin.denom).toBe("TEST");
    expect(coin.amount.toString()).toBe("1000");
    expect(coin.toString()).toBe("1000TEST");

    coin = Coin.parse("1000  TEST");

    expect(coin.denom).toBe("TEST");
    expect(coin.amount.toString()).toBe("1000");
    expect(coin.toString()).toBe("1000TEST");

    expect(() => Coin.parse("ascasc")).toThrow();
    expect(() => Coin.parse("ascasc asd")).toThrow();
    expect(() => Coin.parse("100 ascasc asd")).toThrow();
    expect(() => Coin.parse("asd 100")).toThrow();
  });
});
