import { parseDomainUntilSecondLevel } from "./utils";

describe("Test phishing list service utils", () => {
  test("Test parseDomainUntilSecondLevel", () => {
    const tests: ({
      url: string;
    } & ({ expect: string } | { invalid: true }))[] = [
      {
        url: "",
        invalid: true,
      },
      {
        url: ".",
        invalid: true,
      },
      {
        url: "..",
        invalid: true,
      },
      {
        url: ".test.",
        invalid: true,
      },
      {
        url: "..test",
        invalid: true,
      },
      {
        url: "test.com.",
        expect: "test.com",
      },
      {
        url: "test.com..",
        expect: "test.com",
      },
      {
        url: ".test.com.",
        expect: "test.com",
      },
      {
        url: "..test.com..",
        expect: "test.com",
      },
      {
        url: "test..com",
        expect: "test.com",
      },
      {
        url: "..test..com..",
        expect: "test.com",
      },
      {
        url: "asd.test.com.",
        expect: "test.com",
      },
      {
        url: "asd..test.com.",
        expect: "test.com",
      },
      {
        url: "http://",
        invalid: true,
      },
      {
        url: "https://.",
        invalid: true,
      },
      {
        url: "https://..",
        invalid: true,
      },
      {
        url: "https://.test.",
        invalid: true,
      },
      {
        url: "https://..test",
        invalid: true,
      },
      {
        url: "https://test.com.",
        expect: "test.com",
      },
      {
        url: "https://test.com..",
        expect: "test.com",
      },
      {
        url: "https://.test.com.",
        expect: "test.com",
      },
      {
        url: "https://..test.com..",
        expect: "test.com",
      },
      {
        url: "https://test..com",
        expect: "test.com",
      },
      {
        url: "https://..test..com..",
        expect: "test.com",
      },
      {
        url: "https://asd.test.com.",
        expect: "test.com",
      },
      {
        url: "https://asd..test.com.",
        expect: "test.com",
      },
      {
        url:
          "chrome-extension://hajcclbibbmagnhankhjinooiploogfm/_generated_background_page.html",
        invalid: true,
      },
      {
        url: "chrome-extension://hajcclbibbmagnhankhjinooiploogfm.test/",
        expect: "hajcclbibbmagnhankhjinooiploogfm.test",
      },
      {
        url: "chrome-extension://hajcclbibbmagnhankhjinooiploogfm.test/?test=1",
        expect: "hajcclbibbmagnhankhjinooiploogfm.test",
      },
      {
        url: "chrome-extension://hajcclbibbmagnhankhjinooiploogfm.test?test=1",
        expect: "hajcclbibbmagnhankhjinooiploogfm.test",
      },
      {
        url:
          "chrome-extension://hajcclbibbmagnhankhjinooiploogfm.test/_generated_background_page.html",
        expect: "hajcclbibbmagnhankhjinooiploogfm.test",
      },
    ];

    for (const test of tests) {
      if ("invalid" in test) {
        expect(() => parseDomainUntilSecondLevel(test.url)).toThrow();
      } else {
        expect(parseDomainUntilSecondLevel(test.url)).toBe(test.expect);
      }
    }
  });
});
