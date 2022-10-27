import Http from "http";
import { chainInfoForCheck, checkChainFeatures, hasFeature } from "./feature";

const createMockServer = (
  ibcGoSuccess: boolean,
  ibcTransferSuccess: boolean,
  WasmSuccess: boolean,
  SpendableBalancesSuccess: boolean
) => {
  const server = Http.createServer((req, resp) => {
    if (req.url === "/ibc/apps/transfer/v1/params") {
      resp.writeHead(ibcGoSuccess ? 200 : 400, {
        "content-type": "text/plain",
      });
      resp.end(
        JSON.stringify({
          params: { receive_enabled: ibcGoSuccess, send_enabled: ibcGoSuccess },
        })
      );
    }

    if (req.url === "/ibc/applications/transfer/v1beta1/params") {
      resp.writeHead(200, {
        "content-type": "text/plain",
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

describe("The chain server supports all features(체인 서버가 모든 기능을 지원할 때)", () => {
  let port: number = -1;
  let closeServer: (() => void) | undefined;

  beforeEach(() => {
    jest.useFakeTimers();

    const server = createMockServer(true, true, true, true);
    port = server.port;
    closeServer = server.closeServer;
  });

  afterEach(() => {
    if (closeServer) {
      closeServer();
      closeServer = undefined;
    }

    jest.useRealTimers();
  });

  /**
   * @Given The server support all features, No input JSON feature
   * @When When you input 'ibc-go' feature in 'hasFeature' function
   * @Then return "ibc-go" string
   */
  test("When you input 'ibc-go' feature in 'hasFeature' function", async () => {
    const mockChainInfoForCheck: chainInfoForCheck = {
      rest: `http://127.0.0.1:${port}`,
      features: [],
    };

    const feature = await hasFeature(mockChainInfoForCheck, "ibc-go");
    expect(feature).toEqual("ibc-go");
  });

  /**
   * @Given The server support all features, No input JSON feature
   * @When When you input 'ibc-transfer' feature in 'hasFeature' function
   * @Then return "ibc-transfer" string
   */
  test("When you input 'ibc-transfer' feature in 'hasFeature' function", async () => {
    const mockChainInfoForCheck: chainInfoForCheck = {
      rest: `http://127.0.0.1:${port}`,
      features: [],
    };

    const feature = await hasFeature(mockChainInfoForCheck, "ibc-transfer");
    expect(feature).toEqual("ibc-transfer");
  });

  /**
   * @Given The server support all features, Input 'ibc-go' in JSON feature
   * @When When you input 'ibc-transfer' feature in 'hasFeature' function
   * @Then return "ibc-transfer" string
   */
  test("When you input 'ibc-transfer' feature in 'hasFeature' function(Input 'ibc-go' in JSON feature)", async () => {
    const mockChainInfoForCheck: chainInfoForCheck = {
      rest: `http://127.0.0.1:${port}`,
      features: ["ibc-go"],
    };

    const feature = await hasFeature(mockChainInfoForCheck, "ibc-transfer");
    expect(feature).toEqual("ibc-transfer");
  });

  /**
   * @Given The server support all features, No input JSON feature
   * @When When you input 'wasmd_0.24+' feature in 'hasFeature' function
   * @Then return undefined
   */
  test("When you input 'wasmd_0.24+' feature in 'hasFeature' function", async () => {
    const mockChainInfoForCheck: chainInfoForCheck = {
      rest: `http://127.0.0.1:${port}`,
      features: [],
    };

    const feature = await hasFeature(mockChainInfoForCheck, "wasmd_0.24+");
    expect(feature).toEqual(undefined);
  });

  /**
   * @Given The server support all features, Input 'cosmwasm' in JSON feature
   * @When When you input 'wasmd_0.24+' feature in 'hasFeature' function
   * @Then return "wasmd_0.24+" string
   */
  test("When you input 'wasmd_0.24+' feature in 'hasFeature' function", async () => {
    const mockChainInfoForCheck: chainInfoForCheck = {
      rest: `http://127.0.0.1:${port}`,
      features: ["cosmwasm"],
    };

    const feature = await hasFeature(mockChainInfoForCheck, "wasmd_0.24+");
    expect(feature).toEqual("wasmd_0.24+");
  });

  /**
   * @Given The server support all features, No input JSON feature
   * @When When you input 'query:/cosmos/bank/v1beta1/spendable_balances' feature in 'hasFeature' function
   * @Then return "query:/cosmos/bank/v1beta1/spendable_balances" string
   */
  test("When you input 'query:/cosmos/bank/v1beta1/spendable_balances' feature in 'hasFeature' function", async () => {
    const mockChainInfoForCheck: chainInfoForCheck = {
      rest: `http://127.0.0.1:${port}`,
      features: [],
    };

    const feature = await hasFeature(
      mockChainInfoForCheck,
      "query:/cosmos/bank/v1beta1/spendable_balances"
    );
    expect(feature).toEqual("query:/cosmos/bank/v1beta1/spendable_balances");
  });

  /**
   * @Given The server support all features
   * @When When you input that there are no supported features
   * @Then return "ibc-go", "ibc-transfer", "query:/cosmos/bank/v1beta1/spendable_balances", features
   */
  test("When you input that there are no supported features(지원하는 기능이 없다고 입력했을 때)", async () => {
    const mockChainInfoForCheck: chainInfoForCheck = {
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
   * @When When you input that there is 'cosmwasm' feature
   * @Then return all features
   */
  test("When you input that there is 'cosmwasm' feature", async () => {
    const mockChainInfoForCheck: chainInfoForCheck = {
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
    jest.useFakeTimers();

    const server = createMockServer(false, false, false, false);
    port = server.port;
    closeServer = server.closeServer;
  });

  afterEach(() => {
    if (closeServer) {
      closeServer();
      closeServer = undefined;
    }

    jest.useRealTimers();
  });

  /**
   * @Given The server doesn't support all features, No input JSON feature
   * @When When you input 'ibc-go' feature in 'hasFeature' function
   * @Then return "Failed to get response /ibc/apps/transfer/v1/params from lcd endpoint" error string
   */
  test("When you input 'ibc-go' feature in 'hasFeature' function", async () => {
    const mockChainInfoForCheck: chainInfoForCheck = {
      rest: `http://127.0.0.1:${port}`,
      features: [],
    };

    try {
      await hasFeature(mockChainInfoForCheck, "ibc-go");
    } catch (error) {
      expect(error).toHaveProperty(
        "message",
        "Failed to get response /ibc/apps/transfer/v1/params from lcd endpoint"
      );
    }
  });

  /**
   * @Given The server doesn't support all features, No input JSON feature
   * @When When you input 'ibc-transfer' feature in 'hasFeature' function
   * @Then return undefined
   */
  test("When you input 'ibc-transfer' feature in 'hasFeature' function", async () => {
    const mockChainInfoForCheck: chainInfoForCheck = {
      rest: `http://127.0.0.1:${port}`,
      features: [],
    };

    const feature = await hasFeature(mockChainInfoForCheck, "ibc-transfer");
    expect(feature).toEqual(undefined);
  });

  /**
   * @Given The server doesn't support all features, Input 'ibc-go' in JSON feature
   * @When When you input 'ibc-transfer' feature in 'hasFeature' function
   * @Then return "Failed to get response /ibc/apps/transfer/v1/params from lcd endpoint" error string
   */
  test("When you input 'ibc-transfer' feature in 'hasFeature' function(Input 'ibc-go' in JSON feature)", async () => {
    const mockChainInfoForCheck: chainInfoForCheck = {
      rest: `http://127.0.0.1:${port}`,
      features: ["ibc-go"],
    };

    try {
      await hasFeature(mockChainInfoForCheck, "ibc-transfer");
    } catch (error) {
      expect(error).toHaveProperty(
        "message",
        "Failed to get response /ibc/apps/transfer/v1/params from lcd endpoint"
      );
    }
  });

  /**
   * @Given The server doesn't support all features, No input JSON feature
   * @When When you input 'wasmd_0.24+' feature in 'hasFeature' function
   * @Then return undefined
   */
  test("When you input 'wasmd_0.24+' feature in 'hasFeature' function", async () => {
    const mockChainInfoForCheck: chainInfoForCheck = {
      rest: `http://127.0.0.1:${port}`,
      features: [],
    };

    const feature = await hasFeature(mockChainInfoForCheck, "wasmd_0.24+");
    expect(feature).toEqual(undefined);
  });

  /**
   * @Given The server doesn't support all features, Input 'cosmwasm' in JSON feature
   * @When When you input 'wasmd_0.24+' feature in 'hasFeature' function
   * @Then return undefined
   */
  test("When you input 'wasmd_0.24+' feature in 'hasFeature' function", async () => {
    const mockChainInfoForCheck: chainInfoForCheck = {
      rest: `http://127.0.0.1:${port}`,
      features: ["cosmwasm"],
    };

    const feature = await hasFeature(mockChainInfoForCheck, "wasmd_0.24+");
    expect(feature).toEqual(undefined);
  });

  /**
   * @Given The server doesn't support all features, No input JSON feature
   * @When When you input 'query:/cosmos/bank/v1beta1/spendable_balances' feature in 'hasFeature' function
   * @Then return undefined
   */
  test("When you input 'query:/cosmos/bank/v1beta1/spendable_balances' feature in 'hasFeature' function", async () => {
    const mockChainInfoForCheck: chainInfoForCheck = {
      rest: `http://127.0.0.1:${port}`,
      features: [],
    };

    const feature = await hasFeature(
      mockChainInfoForCheck,
      "query:/cosmos/bank/v1beta1/spendable_balances"
    );
    expect(feature).toEqual(undefined);
  });
});
