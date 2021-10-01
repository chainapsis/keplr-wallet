/**
 * @jest-environment jsdom
 */

import { clearDecimals } from "./messages";

describe("Test methods in messages", () => {
  test("Test clearDecimals", () => {
    expect(clearDecimals("0.00100")).toBe("0.001");
    expect(clearDecimals("10.00100")).toBe("10.001");
    expect(clearDecimals("100")).toBe("100");
    expect(clearDecimals("0")).toBe("0");
    expect(clearDecimals("10.00101")).toBe("10.00101");
    expect(clearDecimals("0.1")).toBe("0.1");
  });
});
