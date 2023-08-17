import { PhishingListService } from "./service";
import Http from "http";

const phishings = [
  "keplr-vvallet-app.online",
  "xn--kplr-vva.com",
  "keplr-vvallet.tech",
  "app-keplr-vvallet.online",
  "keplr-vvallet-app.space",
  "keplr-vvallet-app.host",
  "app-keplr-vvallet.tech",
  "app-keplr-vvallet.host",
];

const subdomains = ["scam1.service.com", "scam2.service.com"];

const createMockServer = () => {
  let queryCount = 0;

  const server = Http.createServer((req, resp) => {
    queryCount++;

    // Most desired case
    if (req.url === "/list1") {
      resp.writeHead(200);
      resp.end(phishings.join("\n"));
      return;
    }

    // If some strange cases exist
    if (req.url === "/list2") {
      resp.writeHead(200);
      let str = "";
      for (let i = 0; i < phishings.length; i++) {
        let phishing = phishings[i];

        switch (i) {
          case 0:
            phishing = phishing + "\n";
            break;
          case 1:
            // Windows line break
            phishing = phishing + "\r\n";
            break;
          case 2:
            phishing = phishing + ";";
            break;
          case 3:
            phishing = phishing + ",";
            break;
          case 4:
            phishing = phishing + "   ; ";
            break;
          case 5:
            phishing = phishing + " ,  ";
            break;
          default:
            phishing = `  ${phishing} `;
        }

        str += phishing;
      }
      resp.end(str);
      return;
    }

    // When second fetch, add other domain to test fetching interval.
    if (req.url === "/list3") {
      resp.writeHead(200);
      let str = "";
      for (let i = 0; i < phishings.length; i++) {
        let phishing = phishings[i];

        switch (i) {
          case 0:
            phishing = phishing + "\n";
            break;
          case 1:
            phishing = phishing + ".\n";
            break;
          case 2:
            phishing = "." + phishing + "\r\n";
            break;
          case 3:
            phishing = "invalid;.." + phishing + "..;";
            break;
          case 4:
            phishing = phishing + "/,";
            break;
          case 5:
            phishing = phishing + "?test\n";
            break;
          default:
            phishing = `  ${phishing} `;
        }

        str += phishing;
      }
      str += ";invalid";

      if (queryCount === 2) {
        str += ";added.domain";
      }

      resp.end(str);
      return;
    }

    if (req.url === "/subdomains") {
      resp.writeHead(200);
      const list = phishings.concat(subdomains);
      let str = "";
      for (let i = 0; i < list.length; i++) {
        let phishing = list[i];

        switch (i) {
          case 0:
            phishing = phishing + "\n";
            break;
          case 1:
            phishing = phishing + ".\n";
            break;
          case 2:
            phishing = "." + phishing + "\r\n";
            break;
          case 3:
            phishing = "invalid;.." + phishing + "..;";
            break;
          case 4:
            phishing = phishing + "/,";
            break;
          case 5:
            phishing = phishing + "?test\n";
            break;
          default:
            phishing = `  ${phishing} `;
        }

        str += phishing;
      }
      str += ";invalid";

      if (queryCount === 2) {
        str += ";added.domain";
      }

      resp.end(str);
      return;
    }

    if (req.url === "/test-retry") {
      if (queryCount % 3 === 0) {
        resp.writeHead(400);
        resp.end();
        return;
      }

      resp.writeHead(200);
      resp.end(phishings.slice(0, queryCount).join("\n"));
      return;
    }

    throw new Error("invalid url");
  });

  server.listen();

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Failed to get address for server");
  }
  const port = address.port;

  return {
    port,
    closeServer: () => {
      server.close();
    },
    getQueryCount: () => {
      return queryCount;
    },
  };
};

describe("Test phishing list service", () => {
  let eachService: PhishingListService | undefined;
  let port: number = -1;
  let closeServer: (() => void) | undefined;
  let getQueryCount: () => number;

  const notMockSetInterval = setInterval;
  const notMockClearInterval = clearInterval;

  beforeEach(() => {
    jest.useFakeTimers();

    const server = createMockServer();
    port = server.port;
    closeServer = server.closeServer;
    getQueryCount = server.getQueryCount;
  });

  afterEach(() => {
    if (eachService) {
      eachService.stop();
      eachService = undefined;
    }

    if (closeServer) {
      closeServer();
      closeServer = undefined;
    }

    jest.useRealTimers();
  });

  const waitServiceInit = (service: PhishingListService) => {
    return new Promise<void>((resolve) => {
      if (service.hasInited) {
        resolve();
        return;
      }

      const intervalId = notMockSetInterval(() => {
        if (service.hasInited) {
          resolve();
          notMockClearInterval(intervalId);
        }
      }, 10);
    });
  };

  const testCheckURLIsPhishing = (service: PhishingListService) => {
    for (const phishing of phishings) {
      expect(service.checkURLIsPhishing(`http://${phishing}`)).toBe(true);
      expect(service.checkURLIsPhishing(`https://${phishing}`)).toBe(true);
      expect(service.checkURLIsPhishing(`https://test.${phishing}`)).toBe(true);
      expect(service.checkURLIsPhishing(`https://test.${phishing}.`)).toBe(
        true
      );
      expect(service.checkURLIsPhishing(`https://test.${phishing}./`)).toBe(
        true
      );
      expect(service.checkURLIsPhishing(`https://test.${phishing}..`)).toBe(
        true
      );
      expect(service.checkURLIsPhishing(`https://test.${phishing}../`)).toBe(
        true
      );
      expect(
        service.checkURLIsPhishing(`https://test.${phishing}..?test`)
      ).toBe(true);
      expect(
        service.checkURLIsPhishing(`https://test.${phishing}..?test=1`)
      ).toBe(true);
      expect(service.checkURLIsPhishing(`https://.test.test.${phishing}`)).toBe(
        true
      );
      expect(
        service.checkURLIsPhishing(`https://..test.test.${phishing}`)
      ).toBe(true);
      expect(
        service.checkURLIsPhishing(`https://..test..test...${phishing}`)
      ).toBe(true);
    }
  };

  test("Test basic PhishingListService with valid cases", async () => {
    const service = new PhishingListService(
      {
        blockListUrl: `http://127.0.0.1:${port}/list1`,
        fetchingIntervalMs: 3600,
        retryIntervalMs: 3600,
        allowTimeoutMs: 100,
      },
      "http://noop.com"
    );
    eachService = service;

    service.init();

    await waitServiceInit(service);

    testCheckURLIsPhishing(service);
  });

  test("Test basic PhishingListService with strange separators", async () => {
    const service = new PhishingListService(
      {
        blockListUrl: `http://127.0.0.1:${port}/list2`,
        fetchingIntervalMs: 3600,
        retryIntervalMs: 3600,
        allowTimeoutMs: 100,
      },
      "http://noop.com"
    );
    eachService = service;

    service.init();

    await waitServiceInit(service);

    testCheckURLIsPhishing(service);
  });

  test("Test basic PhishingListService with strange cases", async () => {
    const service = new PhishingListService(
      {
        blockListUrl: `http://127.0.0.1:${port}/list3`,
        fetchingIntervalMs: 3600,
        retryIntervalMs: 3600,
        allowTimeoutMs: 100,
      },
      "http://noop.com"
    );
    eachService = service;

    service.init();

    await waitServiceInit(service);

    testCheckURLIsPhishing(service);
  });

  test("Test basic PhishingListService fetching interval", async () => {
    const service = new PhishingListService(
      {
        blockListUrl: `http://127.0.0.1:${port}/list3`,
        fetchingIntervalMs: 200,
        retryIntervalMs: 3600,
        allowTimeoutMs: 100,
      },
      "http://noop.com"
    );
    const spyFetch = jest.spyOn(service.urlFetcher, "fetch");
    eachService = service;

    service.init();

    await waitServiceInit(service);

    expect(spyFetch).toBeCalledTimes(1);
    testCheckURLIsPhishing(service);
    expect(service.checkURLIsPhishing("https://added.domain")).toBe(false);

    expect(getQueryCount()).toBe(1);

    // Proceed re-fetching
    jest.advanceTimersByTime(210);

    expect(spyFetch).toBeCalledTimes(2);
    await spyFetch.mock.results[spyFetch.mock.results.length - 1].value;
    testCheckURLIsPhishing(service);
    // See the implementation of /list3
    expect(service.checkURLIsPhishing("https://added.domain")).toBe(true);

    expect(getQueryCount()).toBe(2);

    // Proceed re-fetching
    jest.advanceTimersByTime(210);

    expect(spyFetch).toBeCalledTimes(3);
    await spyFetch.mock.results[spyFetch.mock.results.length - 1].value;
    testCheckURLIsPhishing(service);
    // See the implementation of /list3
    expect(service.checkURLIsPhishing("https://added.domain")).toBe(false);

    expect(getQueryCount()).toBe(3);
  });

  test("Test basic PhishingListService fetching interval with retry interval", async () => {
    const service = new PhishingListService(
      {
        blockListUrl: `http://127.0.0.1:${port}/test-retry`,
        fetchingIntervalMs: 200,
        retryIntervalMs: 100,
        allowTimeoutMs: 100,
      },
      "http://noop.com"
    );
    const spyFetch = jest.spyOn(service.urlFetcher, "fetch");
    eachService = service;

    service.init();

    const testPhishingUntil = (count: number) => {
      const tests = phishings.slice(0, count);
      for (const test of tests) {
        expect(service.checkURLIsPhishing("https://" + test)).toBe(true);
      }
      if (phishings.length > count) {
        const test = phishings[count];
        expect(service.checkURLIsPhishing("https://" + test)).toBe(false);
      }
    };

    await waitServiceInit(service);

    expect(spyFetch).toBeCalledTimes(1);
    testPhishingUntil(1);
    expect(getQueryCount()).toBe(1);

    // Proceed re-fetching
    jest.advanceTimersByTime(210);

    expect(spyFetch).toBeCalledTimes(2);
    await spyFetch.mock.results[spyFetch.mock.results.length - 1].value;
    // See the implementation of /test-retry
    testPhishingUntil(2);
    expect(getQueryCount()).toBe(2);

    // Proceed re-fetching
    jest.advanceTimersByTime(210);

    expect(spyFetch).toBeCalledTimes(3);
    await spyFetch.mock.results[spyFetch.mock.results.length - 1].value;
    // See the implementation of /test-retry
    // In this case, the fetching should be failed.
    // So, there is no update on phishing list.
    testPhishingUntil(2);
    expect(getQueryCount()).toBe(3);

    // Wait retry for failed query
    jest.advanceTimersByTime(110);

    expect(spyFetch).toBeCalledTimes(4);
    await spyFetch.mock.results[spyFetch.mock.results.length - 1].value;
    // See the implementation of /test-retry
    testPhishingUntil(4);
    expect(getQueryCount()).toBe(4);

    // Not yet re-fetching
    jest.advanceTimersByTime(110);

    expect(spyFetch).toBeCalledTimes(4);
    // See the implementation of /test-retry
    testPhishingUntil(4);
    expect(getQueryCount()).toBe(4);

    // Now re-fetching
    jest.advanceTimersByTime(110);

    expect(spyFetch).toBeCalledTimes(5);
    await spyFetch.mock.results[spyFetch.mock.results.length - 1].value;
    // See the implementation of /test-retry
    testPhishingUntil(5);
    expect(getQueryCount()).toBe(5);
  });

  test("Test addUrlTemp allow blocked url", async () => {
    const service = new PhishingListService(
      {
        blockListUrl: `http://127.0.0.1:${port}/list1`,
        fetchingIntervalMs: 200,
        retryIntervalMs: 100,
        allowTimeoutMs: 100,
      },
      "http://noop.com"
    );
    eachService = service;

    service.init();

    await waitServiceInit(service);

    // block phishings site
    const [phishing, anotherPhishing] = phishings;
    expect(service.checkURLIsPhishing("https://" + phishing)).toBe(true);
    expect(service.checkURLIsPhishing("https://test." + phishing)).toBe(true);

    expect(service.checkURLIsPhishing("https://" + anotherPhishing)).toBe(true);
    expect(service.checkURLIsPhishing("https://test." + anotherPhishing)).toBe(
      true
    );

    // allow temp Url
    service.allowUrlTemp("https://" + phishing);
    expect(service.checkURLIsPhishing("https://" + phishing)).toBe(false);
    // but another url still blocked
    expect(service.checkURLIsPhishing("https://" + anotherPhishing)).toBe(true);
    expect(service.checkURLIsPhishing("https://test." + anotherPhishing)).toBe(
      true
    );

    // should be blocked again
    jest.advanceTimersByTime(110);
    expect(service.checkURLIsPhishing("https://" + phishing)).toBe(true);
    expect(service.checkURLIsPhishing("https://test." + phishing)).toBe(true);

    expect(service.checkURLIsPhishing("https://" + anotherPhishing)).toBe(true);
    expect(service.checkURLIsPhishing("https://test." + anotherPhishing)).toBe(
      true
    );
  });

  test("Test subdomains", async () => {
    const service = new PhishingListService(
      {
        blockListUrl: `http://127.0.0.1:${port}/subdomains`,
        fetchingIntervalMs: 200,
        retryIntervalMs: 100,
        allowTimeoutMs: 100,
      },
      "http://noop.com"
    );
    eachService = service;

    service.init();

    await waitServiceInit(service);

    testCheckURLIsPhishing(service);

    expect(service.checkURLIsPhishing("https://service.com")).toBe(false);
    expect(service.checkURLIsPhishing("https://scam1.service.com")).toBe(true);
    expect(service.checkURLIsPhishing("https://scam2.service.com")).toBe(true);

    // allow temp Url
    service.allowUrlTemp("https://service.com");
    expect(service.checkURLIsPhishing("https://scam1.service.com")).toBe(true);
    expect(service.checkURLIsPhishing("https://scam2.service.com")).toBe(true);
    // allow temp Url
    service.allowUrlTemp("https://scam1.service.com");
    expect(service.checkURLIsPhishing("https://scam1.service.com")).toBe(false);
    expect(service.checkURLIsPhishing("https://scam2.service.com")).toBe(true);
  });
});
