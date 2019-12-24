import assert from "assert";
import "mocha";
import { CoinUtils } from "./index";
import { Int } from "@everett-protocol/cosmosjs/common/int";

describe("Test shrink decimals", () => {
  it("shrink decimals", () => {
    let shrinked = CoinUtils.shrinkDecimals(new Int(1), 6, 2, 4);
    assert.strictEqual(shrinked, "0.0000");

    shrinked = CoinUtils.shrinkDecimals(new Int(123), 6, 2, 4);
    assert.strictEqual(shrinked, "0.0001");

    shrinked = CoinUtils.shrinkDecimals(new Int(12345), 6, 2, 4);
    assert.strictEqual(shrinked, "0.0123");

    shrinked = CoinUtils.shrinkDecimals(new Int(12345678), 6, 2, 4);
    assert.strictEqual(shrinked, "12.345");

    // TODO: Things below fail in European form. Test format should be changed from country to country.
    shrinked = CoinUtils.shrinkDecimals(new Int(123456789123), 6, 2, 4);
    assert.strictEqual(shrinked, "123,456.78");

    shrinked = CoinUtils.shrinkDecimals(new Int(123456789123), 6, 0, 4);
    assert.strictEqual(shrinked, "123,456");
  });
});
