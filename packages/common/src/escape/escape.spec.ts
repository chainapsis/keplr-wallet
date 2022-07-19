import { escapeHTML, unescapeHTML } from "./index";

describe("Test escapeHTML", () => {
  test("escapeHTML should escape <, >, &", async () => {
    expect(escapeHTML("<, >, &, ' and \"")).toBe(
      `\\u003c, \\u003e, \\u0026, ' and "`
    );

    expect(escapeHTML("<, >, &, ' and \" and <, >, &, ' and \"")).toBe(
      `\\u003c, \\u003e, \\u0026, ' and " and \\u003c, \\u003e, \\u0026, ' and "`
    );
  });

  test("unescapeHTML should escape <, >, &", async () => {
    expect(unescapeHTML(`\\u003c, \\u003e, \\u0026, ' and "`)).toBe(
      "<, >, &, ' and \""
    );

    expect(
      unescapeHTML(
        `\\u003c, \\u003e, \\u0026, ' and " and \\u003c, \\u003e, \\u0026, ' and "`
      )
    ).toBe("<, >, &, ' and \" and <, >, &, ' and \"");
  });
});
