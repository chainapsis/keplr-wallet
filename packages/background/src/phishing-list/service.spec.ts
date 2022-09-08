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

const createMockServer = () => {
  const server = Http.createServer((req, resp) => {
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
          case 6:
            phishing = "third-domain." + phishing;
            break;
          default:
            phishing = `  ${phishing} `;
        }

        str += phishing;
      }
      resp.end(str);
      return;
    }

    // Even if an invalid endpoint exists, only that endpoint should be ignored and proceeded.
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
          case 6:
            phishing = "third-domain." + phishing + "\n";
            break;
          default:
            phishing = `  ${phishing} `;
        }

        str += phishing;
      }
      str += ";invalid";
      resp.end(str);
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
  };
};

describe("Test phishing list service", () => {
  let eachService: PhishingListService | undefined;
  let port: number = -1;
  let closeServer: (() => void) | undefined;

  beforeEach(() => {
    const server = createMockServer();
    port = server.port;
    closeServer = server.closeServer;
  });

  afterEach(() => {
    if (closeServer) {
      closeServer();
      closeServer = undefined;
    }
    if (eachService) {
      eachService.stop();
      eachService = undefined;
    }
  });

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
    const service = new PhishingListService({
      blockListUrl: `http://127.0.0.1:${port}/list1`,
      fetchingIntervalMs: 3600,
      retryIntervalMs: 3600,
    });
    eachService = service;

    service.init();

    await new Promise((resolve) => setTimeout(resolve, 50));

    testCheckURLIsPhishing(service);
  });

  test("Test basic PhishingListService with strange separators", async () => {
    const service = new PhishingListService({
      blockListUrl: `http://127.0.0.1:${port}/list2`,
      fetchingIntervalMs: 3600,
      retryIntervalMs: 3600,
    });
    eachService = service;

    service.init();

    await new Promise((resolve) => setTimeout(resolve, 50));

    testCheckURLIsPhishing(service);
  });

  test("Test basic PhishingListService with strange cases", async () => {
    const service = new PhishingListService({
      blockListUrl: `http://127.0.0.1:${port}/list3`,
      fetchingIntervalMs: 3600,
      retryIntervalMs: 3600,
    });
    eachService = service;

    service.init();

    await new Promise((resolve) => setTimeout(resolve, 50));

    testCheckURLIsPhishing(service);
  });
});
