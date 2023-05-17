import { CheckURLIsPhishingMsg } from "./messages";

describe("Test phishing list service messages", () => {
  test("Test CheckURLIsPhishingMsg", () => {
    const tests: {
      url: string;
      invalid?: boolean;
    }[] = [
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
        invalid: true,
      },
      {
        url: "test.com..",
        invalid: true,
      },
      {
        url: "asd.test.com.",
        invalid: true,
      },
      {
        url: "asd..test.com.",
        invalid: true,
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
      },
      {
        url: "https://test.com..",
      },
      {
        url: "https://.test.com.",
      },
      {
        url: "https://..test.com..",
      },
      {
        url: "https://test..com",
      },
      {
        url: "https://..test..com..",
      },
      {
        url: "https://asd.test.com.",
      },
      {
        url: "https://asd..test.com.",
      },
    ];

    for (const test of tests) {
      const msg = new CheckURLIsPhishingMsg();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      msg.origin = test.url;

      if ("invalid" in test) {
        expect(() => msg.validateBasic()).toThrow();
      } else {
        expect(() => msg.validateBasic()).not.toThrow();
      }
    }
  });
});
