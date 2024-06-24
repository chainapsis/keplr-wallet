import Http from "http";
import {
  ChainInfoForCheck,
  checkChainFeatures,
  hasFeature,
  NonRecognizableChainFeatures,
  RecognizableChainFeatures,
  SupportedChainFeatures,
} from "./feature";

const createMockServer = (
  ibcGoSuccess: boolean,
  ibcTransferSuccess: boolean,
  WasmSuccess: boolean,
  SpendableBalancesSuccess: boolean
) => {
  let i = 0;

  const server = Http.createServer((req, resp) => {
    i++;

    if (req.url === "/ibc/apps/transfer/v1/params") {
      resp.writeHead(ibcGoSuccess ? 200 : 501, {
        "content-type": "text/json",
      });
      resp.end(
        JSON.stringify({
          params: { receive_enabled: ibcGoSuccess, send_enabled: ibcGoSuccess },
        })
      );
    }

    if (req.url === "/ibc/applications/transfer/v1beta1/params") {
      resp.writeHead(200, {
        "content-type": "text/json",
      });
      resp.end(
        JSON.stringify({
          params: {
            receive_enabled: ibcTransferSuccess,
            send_enabled: ibcTransferSuccess,
          },
        })
      );
    }

    if (req.url === "/cosmwasm/wasm/v1/contract/test/smart/test") {
      resp.writeHead(WasmSuccess ? 400 : 501);
      resp.end();
    }

    if (req.url === "/cosmos/bank/v1beta1/spendable_balances/test") {
      resp.writeHead(SpendableBalancesSuccess ? 400 : 501);
      resp.end();
    }

    if (req.url === "/ibc/apps/router/v1/params") {
      resp.writeHead(501);
      resp.end();
    }

    if (req.url === "/ibc/apps/packetforward/v1/params") {
      resp.writeHead(501);
      resp.end();
    }

    if (req.url === "/feemarket/v1/params") {
      resp.writeHead(501);
      resp.end();
    }
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
    getQueryCount: () => i,
  };
};

describe("The chain server supports all features(체인 서버가 모든 기능을 지원할 때)", () => {
  let port: number = -1;
  let closeServer: (() => void) | undefined;
  let getQueryCount: (() => number) | undefined;

  beforeEach(() => {
    const server = createMockServer(true, true, true, true);
    port = server.port;
    closeServer = server.closeServer;
    getQueryCount = server.getQueryCount;
  });

  afterEach(() => {
    if (closeServer) {
      closeServer();
      closeServer = undefined;
    }
    getQueryCount = undefined;
  });

  test("test features has no duplication", () => {
    let f: Record<string, boolean | undefined> = {};
    for (const feature of SupportedChainFeatures) {
      if (f[feature]) {
        throw new Error(`${feature} is duplicated on SupportedChainFeatures`);
      }

      f[feature] = true;
    }

    f = {};
    for (const feature of RecognizableChainFeatures) {
      if (f[feature]) {
        throw new Error(
          `${feature} is duplicated on RecognizableChainFeatures`
        );
      }

      f[feature] = true;
    }

    f = {};
    for (const feature of NonRecognizableChainFeatures) {
      if (f[feature]) {
        throw new Error(
          `${feature} is duplicated on NonRecognizableChainFeatures`
        );
      }

      f[feature] = true;
    }
  });

  test("test SupportedChainFeatures contains RecognizableChainFeatures/NonRecognizableChainFeatures", () => {
    const f: Record<string, boolean | undefined> = {};
    for (const feature of RecognizableChainFeatures) {
      if (f[feature]) {
        throw new Error(
          `${feature} is duplicated on RecognizableChainFeatures`
        );
      }

      f[feature] = true;
    }

    for (const feature of NonRecognizableChainFeatures) {
      if (f[feature]) {
        throw new Error(
          `${feature} is duplicated on RecognizableChainFeatures/NonRecognizableChainFeatures`
        );
      }

      f[feature] = true;
    }

    expect(Object.keys(f).sort()).toStrictEqual(SupportedChainFeatures.sort());
  });

  test("hasFeature should not make query if chain info already include feature", async () => {
    const mockChainInfoForCheck: ChainInfoForCheck = {
      rpc: "noop",
      rest: `http://127.0.0.1:${port}`,
      features: ["ibc-go"],
    };

    expect(await hasFeature(mockChainInfoForCheck, "ibc-go")).toEqual(true);

    expect(getQueryCount!()).toEqual(0);
  });

  test("checkChainFeatures should not make query if chain info already include feature", async () => {
    const mockChainInfoForCheck: ChainInfoForCheck = {
      rpc: "noop",
      rest: `http://127.0.0.1:${port}`,
      features: ["ibc-go"],
    };

    expect(await checkChainFeatures(mockChainInfoForCheck)).toEqual([
      "ibc-transfer",
      "query:/cosmos/bank/v1beta1/spendable_balances",
    ]);

    expect(getQueryCount!()).toEqual(5);
  });

  /**
   * @Given The server support all features, No input JSON feature
   * @When When you input 'ibc-go' feature in 'hasFeature' function
   * @Then return true
   */
  test("When you input 'ibc-go' feature in 'hasFeature' function", async () => {
    const mockChainInfoForCheck: ChainInfoForCheck = {
      rpc: "noop",
      rest: `http://127.0.0.1:${port}`,
      features: [],
    };

    const feature = await hasFeature(mockChainInfoForCheck, "ibc-go");
    expect(feature).toEqual(true);
  });

  /**
   * @Given The server support all features, No input JSON feature
   * @When When you input 'ibc-transfer' feature in 'hasFeature' function
   * @Then return true
   */
  test("When you input 'ibc-transfer' feature in 'hasFeature' function", async () => {
    const mockChainInfoForCheck: ChainInfoForCheck = {
      rpc: "noop",
      rest: `http://127.0.0.1:${port}`,
      features: [],
    };

    const feature = await hasFeature(mockChainInfoForCheck, "ibc-transfer");
    expect(feature).toEqual(true);
  });

  /**
   * @Given The server support all features, Input 'ibc-go' in JSON feature
   * @When When you input 'ibc-transfer' feature in 'hasFeature' function
   * @Then return true
   */
  test("When you input 'ibc-transfer' feature in 'hasFeature' function(Input 'ibc-go' in JSON feature)", async () => {
    const mockChainInfoForCheck: ChainInfoForCheck = {
      rpc: "noop",
      rest: `http://127.0.0.1:${port}`,
      features: ["ibc-go"],
    };

    const feature = await hasFeature(mockChainInfoForCheck, "ibc-transfer");
    expect(feature).toEqual(true);
  });

  /**
   * @Given The server support all features, No input JSON feature
   * @When When you input 'wasmd_0.24+' feature in 'hasFeature' function
   * @Then return false
   */
  test("When you input 'wasmd_0.24+' feature in 'hasFeature' function", async () => {
    const mockChainInfoForCheck: ChainInfoForCheck = {
      rpc: "noop",
      rest: `http://127.0.0.1:${port}`,
      features: [],
    };

    const feature = await hasFeature(mockChainInfoForCheck, "wasmd_0.24+");
    expect(feature).toEqual(false);
  });

  /**
   * @Given The server support all features, Input 'cosmwasm' in JSON feature
   * @When When you input 'wasmd_0.24+' feature in 'hasFeature' function
   * @Then return "wasmd_0.24+" string
   */
  test("When you input 'wasmd_0.24+' feature in 'hasFeature' function with 'cosmwasm' feature", async () => {
    const mockChainInfoForCheck: ChainInfoForCheck = {
      rpc: "noop",
      rest: `http://127.0.0.1:${port}`,
      features: ["cosmwasm"],
    };

    const feature = await hasFeature(mockChainInfoForCheck, "wasmd_0.24+");
    expect(feature).toEqual(true);
  });

  /**
   * @Given The server support all features, No input JSON feature
   * @When When you input 'query:/cosmos/bank/v1beta1/spendable_balances' feature in 'hasFeature' function
   * @Then return true
   */
  test("When you input 'query:/cosmos/bank/v1beta1/spendable_balances' feature in 'hasFeature' function", async () => {
    const mockChainInfoForCheck: ChainInfoForCheck = {
      rpc: "noop",
      rest: `http://127.0.0.1:${port}`,
      features: [],
    };

    const feature = await hasFeature(
      mockChainInfoForCheck,
      "query:/cosmos/bank/v1beta1/spendable_balances"
    );
    expect(feature).toEqual(true);
  });

  /**
   * @Given The server support all features
   * @When When you input that there are no supported features
   * @Then return "ibc-go", "ibc-transfer", "query:/cosmos/bank/v1beta1/spendable_balances", features
   */
  test("When you input that there are no supported features(지원하는 기능이 없다고 입력했을 때)", async () => {
    const mockChainInfoForCheck: ChainInfoForCheck = {
      rpc: "noop",
      rest: `http://127.0.0.1:${port}`,
      features: [],
    };

    const features = await checkChainFeatures(mockChainInfoForCheck);

    expect(features).toEqual([
      "ibc-go",
      "ibc-transfer",
      "query:/cosmos/bank/v1beta1/spendable_balances",
    ]);
  });

  /**
   * @Given The server support all features
   * @When When you input undefined in supported features
   * @Then return "ibc-go", "ibc-transfer", "query:/cosmos/bank/v1beta1/spendable_balances", features
   */
  test("When you input undefined in supported features", async () => {
    const mockChainInfoForCheck: ChainInfoForCheck = {
      rpc: "noop",
      rest: `http://127.0.0.1:${port}`,
      features: undefined,
    };

    const features = await checkChainFeatures(mockChainInfoForCheck);

    expect(features).toEqual([
      "ibc-go",
      "ibc-transfer",
      "query:/cosmos/bank/v1beta1/spendable_balances",
    ]);
  });

  /**
   * @Given The server support all features
   * @When When you input that there is 'cosmwasm' feature
   * @Then return all features
   */
  test("When you input that there is 'cosmwasm' feature", async () => {
    const mockChainInfoForCheck: ChainInfoForCheck = {
      rpc: "noop",
      rest: `http://127.0.0.1:${port}`,
      features: ["cosmwasm"],
    };

    const features = await checkChainFeatures(mockChainInfoForCheck);

    expect(features).toEqual([
      "ibc-go",
      "ibc-transfer",
      "wasmd_0.24+",
      "query:/cosmos/bank/v1beta1/spendable_balances",
    ]);
  });
});

describe("The chain server doesn't support all features(체인 서버가 모든 기능을 지원하지 않을 때)", () => {
  let port: number = -1;
  let closeServer: (() => void) | undefined;

  beforeEach(() => {
    const server = createMockServer(false, false, false, false);
    port = server.port;
    closeServer = server.closeServer;
  });

  afterEach(() => {
    if (closeServer) {
      closeServer();
      closeServer = undefined;
    }
  });

  /**
   * @Given The server doesn't support all features, No input JSON feature
   * @When When you input 'ibc-go' feature in 'hasFeature' function
   * @Then return "Failed to get response /ibc/apps/transfer/v1/params from lcd endpoint" error string
   */
  test("When you input 'ibc-go' feature in 'hasFeature' function", async () => {
    const mockChainInfoForCheck: ChainInfoForCheck = {
      rpc: "noop",
      rest: `http://127.0.0.1:${port}`,
      features: [],
    };

    expect(await hasFeature(mockChainInfoForCheck, "ibc-go")).toEqual(false);
  });

  /**
   * @Given The server doesn't support all features, No input JSON feature
   * @When When you input 'ibc-transfer' feature in 'hasFeature' function
   * @Then return undefined
   */
  test("When you input 'ibc-transfer' feature in 'hasFeature' function", async () => {
    const mockChainInfoForCheck: ChainInfoForCheck = {
      rpc: "noop",
      rest: `http://127.0.0.1:${port}`,
      features: [],
    };

    const feature = await hasFeature(mockChainInfoForCheck, "ibc-transfer");
    expect(feature).toEqual(false);
  });

  /**
   * @Given The server doesn't support all features, Input 'ibc-go' in JSON feature
   * @When When you input 'ibc-transfer' feature in 'hasFeature' function
   * @Then return "Failed to get response /ibc/apps/transfer/v1/params from lcd endpoint" error string
   */
  test("When you input 'ibc-transfer' feature in 'hasFeature' function(Input 'ibc-go' in JSON feature)", async () => {
    const mockChainInfoForCheck: ChainInfoForCheck = {
      rpc: "noop",
      rest: `http://127.0.0.1:${port}`,
      features: ["ibc-go"],
    };

    expect(await hasFeature(mockChainInfoForCheck, "ibc-transfer")).toBe(false);
  });

  /**
   * @Given The server doesn't support all features, No input JSON feature
   * @When When you input 'wasmd_0.24+' feature in 'hasFeature' function
   * @Then return undefined
   */
  test("When you input 'wasmd_0.24+' feature in 'hasFeature' function", async () => {
    const mockChainInfoForCheck: ChainInfoForCheck = {
      rpc: "noop",
      rest: `http://127.0.0.1:${port}`,
      features: [],
    };

    const feature = await hasFeature(mockChainInfoForCheck, "wasmd_0.24+");
    expect(feature).toEqual(false);
  });

  /**
   * @Given The server doesn't support all features, Input 'cosmwasm' in JSON feature
   * @When When you input 'wasmd_0.24+' feature in 'hasFeature' function
   * @Then return undefined
   */
  test("When you input 'wasmd_0.24+' feature in 'hasFeature' function", async () => {
    const mockChainInfoForCheck: ChainInfoForCheck = {
      rpc: "noop",
      rest: `http://127.0.0.1:${port}`,
      features: ["cosmwasm"],
    };

    const feature = await hasFeature(mockChainInfoForCheck, "wasmd_0.24+");
    expect(feature).toEqual(false);
  });

  /**
   * @Given The server doesn't support all features, No input JSON feature
   * @When When you input 'query:/cosmos/bank/v1beta1/spendable_balances' feature in 'hasFeature' function
   * @Then return undefined
   */
  test("When you input 'query:/cosmos/bank/v1beta1/spendable_balances' feature in 'hasFeature' function", async () => {
    const mockChainInfoForCheck: ChainInfoForCheck = {
      rpc: "noop",
      rest: `http://127.0.0.1:${port}`,
      features: [],
    };

    const feature = await hasFeature(
      mockChainInfoForCheck,
      "query:/cosmos/bank/v1beta1/spendable_balances"
    );
    expect(feature).toEqual(false);
  });
});
