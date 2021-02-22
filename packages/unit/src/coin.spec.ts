import assert from "assert";
import "mocha";
import { Coin } from "./coin";

describe("Test coin", () => {
  it("coin parsed from str properly", () => {
    let coin = Coin.parse("1000test");

    assert.strictEqual(coin.denom, "test");
    assert.strictEqual(coin.amount.toString(), "1000");

    coin = Coin.parse("1000tesT");

    assert.strictEqual(coin.denom, "tesT");
    assert.strictEqual(coin.amount.toString(), "1000");

    coin = Coin.parse("1000TEST");

    assert.strictEqual(coin.denom, "TEST");
    assert.strictEqual(coin.amount.toString(), "1000");
  });
});
